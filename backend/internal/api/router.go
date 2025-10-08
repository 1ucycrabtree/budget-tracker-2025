package api

import (
	"context"
	"net/http"
	"slices"
	"strings"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
	"google.golang.org/api/option"

	"backend/internal/db"
	config "backend/internal/setup"

	_ "backend/docs"

	firebase "firebase.google.com/go/v4"
	"firebase.google.com/go/v4/auth"

	httpSwagger "github.com/swaggo/http-swagger"
)

type RouterDeps struct {
	Repo   db.Repository
	Config *config.AppConfig
}

type contextKey string

const userIDKey contextKey = "userID"

func FirebaseAuthMiddleware(client *auth.Client) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			authHeader := r.Header.Get("Authorization")
			if !strings.HasPrefix(authHeader, "Bearer ") {
				http.Error(w, "Missing or invalid Authorization header", http.StatusUnauthorized)
				return
			}
			idToken := strings.TrimPrefix(authHeader, "Bearer ")
			token, err := client.VerifyIDToken(r.Context(), idToken)
			if err != nil {
				http.Error(w, "Invalid token", http.StatusUnauthorized)
				return
			}
			ctx := context.WithValue(r.Context(), userIDKey, token.UID)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

func NewRouter(repo db.Repository, cfg *config.AppConfig) http.Handler {
	var opts []option.ClientOption
	if cfg.LocalCredentialsPath != "" {
		opts = append(opts, option.WithCredentialsFile(cfg.LocalCredentialsPath))
	}
	app, err := firebase.NewApp(context.Background(), nil, opts...)
	if err != nil {
		panic("Failed to initialize Firebase app: " + err.Error())
	}
	authClient, err := app.Auth(context.Background())
	if err != nil {
		panic("Failed to initialize Firebase Auth client: " + err.Error())
	}
	r := mux.NewRouter()
	deps := &RouterDeps{
		Repo:   repo,
		Config: cfg,
	}

	allowOriginFunc := func(origin string) bool {
		if slices.Contains(cfg.CorsAllowedOrigins, origin) {
			return true
		}
		if cfg.VercelPreviewRegex.MatchString(origin) {
			return true
		}
		return false
	}

	c := cors.New(cors.Options{
		AllowOriginFunc:  allowOriginFunc,
		AllowedMethods:   []string{"GET", "POST", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type", "Authorization", "user-id"},
		AllowCredentials: true,
		Debug:            (cfg.Environment != "production"),
	})

	r.PathPrefix("/swagger/").Handler(httpSwagger.WrapHandler)

	// Health handler (no user-id required)
	r.HandleFunc("/health", deps.HealthCheckHandler).Methods("GET")

	// User profile setup (no user-id required)
	userProfileDeps := &SetupUserProfileDeps{Repo: repo}
	r.HandleFunc("/setupUserProfile", userProfileDeps.SetupUserProfileHandler).Methods("POST")

	// Transaction handlers (require user-id)
	r.Handle("/transactions/{id}", FirebaseAuthMiddleware(authClient)(http.HandlerFunc(deps.GetTransactionByIDHandler))).Methods("GET")
	r.Handle("/transactions", FirebaseAuthMiddleware(authClient)(http.HandlerFunc(deps.ListTransactionsHandler))).Methods("GET")
	r.Handle("/transactions/{id}", FirebaseAuthMiddleware(authClient)(http.HandlerFunc(deps.UpdateTransactionHandler))).Methods("PATCH")
	r.Handle("/transactions/{id}", FirebaseAuthMiddleware(authClient)(http.HandlerFunc(deps.DeleteTransactionHandler))).Methods("DELETE")

	// Import handlers (require user-id)
	r.Handle("/transactions", FirebaseAuthMiddleware(authClient)(http.HandlerFunc(deps.CreateTransactionHandler))).Methods("POST")
	r.Handle("/transactions/bulk", FirebaseAuthMiddleware(authClient)(http.HandlerFunc(deps.BulkAddTransactionsHandler))).Methods("POST")
	r.Handle("/transactions/import", FirebaseAuthMiddleware(authClient)(http.HandlerFunc(deps.ImportTransactionsHandler))).Methods("POST")

	// Category handlers (require user-id)
	r.Handle("/categories", FirebaseAuthMiddleware(authClient)(http.HandlerFunc(deps.ListCategoriesHandler))).Methods("GET")
	r.Handle("/categories", FirebaseAuthMiddleware(authClient)(http.HandlerFunc(deps.AddCategoryHandler))).Methods("POST")
	r.Handle("/categories/{id}", FirebaseAuthMiddleware(authClient)(http.HandlerFunc(deps.UpdateCategoryHandler))).Methods("PATCH")
	r.Handle("/categories/{id}", FirebaseAuthMiddleware(authClient)(http.HandlerFunc(deps.DeleteCategoryHandler))).Methods("DELETE")

	// Analytics handlers (require user-id)
	r.Handle("/forecast/monthly", RequireUserIDMiddleware(http.HandlerFunc(deps.ForecastMonthlyHandler))).Methods("GET")
  
	c := cors.New(cors.Options{
		AllowedOrigins:   cfg.CorsAllowedOrigins,
		AllowedMethods:   []string{"GET", "POST", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type", "Authorization", HeaderUserID},
		AllowCredentials: true,
		Debug:            true,
	})

	handler := c.Handler(r)
	return handler
}
