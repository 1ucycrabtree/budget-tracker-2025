package api

import (
	"net/http"

	"github.com/gorilla/mux"
	"github.com/rs/cors"

	"backend/internal/db"
	config "backend/internal/setup"

	_ "backend/docs"

	httpSwagger "github.com/swaggo/http-swagger"
)

type RouterDeps struct {
	Repo   db.Repository
	Config *config.AppConfig
}

// RequireUserIDMiddleware checks for the presence of the "user-id" header.
func RequireUserIDMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		userID := r.Header.Get("user-id")
		if userID == "" {
			http.Error(w, "Missing user-id header", http.StatusUnauthorized)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func NewRouter(repo db.Repository, cfg *config.AppConfig) http.Handler {
	r := mux.NewRouter()
	deps := &RouterDeps{
		Repo:   repo,
		Config: cfg,
	}

	r.PathPrefix("/swagger/").Handler(httpSwagger.WrapHandler)

	// Health handler (no user-id required)
	r.HandleFunc("/health", deps.HealthCheckHandler).Methods("GET")

	// User profile setup (no user-id required)
	userProfileDeps := &SetupUserProfileDeps{Repo: repo}
	r.HandleFunc("/setupUserProfile", userProfileDeps.SetupUserProfileHandler).Methods("POST")

	// Transaction handlers (require user-id)
	r.Handle("/transactions/{id}", RequireUserIDMiddleware(http.HandlerFunc(deps.GetTransactionByIDHandler))).Methods("GET")
	r.Handle("/transactions", RequireUserIDMiddleware(http.HandlerFunc(deps.ListTransactionsHandler))).Methods("GET")
	r.Handle("/transactions/{id}", RequireUserIDMiddleware(http.HandlerFunc(deps.UpdateTransactionHandler))).Methods("PATCH")
	r.Handle("/transactions/{id}", RequireUserIDMiddleware(http.HandlerFunc(deps.DeleteTransactionHandler))).Methods("DELETE")

	// Import handlers (require user-id)
	r.Handle("/transactions", RequireUserIDMiddleware(http.HandlerFunc(deps.CreateTransactionHandler))).Methods("POST")
	r.Handle("/transactions/bulk", RequireUserIDMiddleware(http.HandlerFunc(deps.BulkAddTransactionsHandler))).Methods("POST")
	r.Handle("/transactions/import", RequireUserIDMiddleware(http.HandlerFunc(deps.ImportTransactionsHandler))).Methods("POST")

	// Category handlers (require user-id)
	r.Handle("/categories", RequireUserIDMiddleware(http.HandlerFunc(deps.ListCategoriesHandler))).Methods("GET")
	r.Handle("/categories", RequireUserIDMiddleware(http.HandlerFunc(deps.AddCategoryHandler))).Methods("POST")
	r.Handle("/categories/{id}", RequireUserIDMiddleware(http.HandlerFunc(deps.UpdateCategoryHandler))).Methods("PATCH")
	r.Handle("/categories/{id}", RequireUserIDMiddleware(http.HandlerFunc(deps.DeleteCategoryHandler))).Methods("DELETE")

	c := cors.New(cors.Options{
		AllowedOrigins:   cfg.CorsAllowedOrigins,
		AllowedMethods:   []string{"GET", "POST", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type", "Authorization", "User-Id"},
		AllowCredentials: true,
		Debug:            true,
	})

	handler := c.Handler(r)
	return handler
}
