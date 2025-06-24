package api

import (
	"github.com/gorilla/mux"
	"github.com/rs/cors"
	"net/http"

	"github.com/1ucycrabtree/budget-tracker-2025/backend/internal/db"
	config "github.com/1ucycrabtree/budget-tracker-2025/backend/internal/setup"
)

type RouterDeps struct {
	Repo   db.Repository
	Config *config.AppConfig
}

func NewRouter(repo db.Repository, cfg *config.AppConfig) http.Handler {
	r := mux.NewRouter()
	deps := &RouterDeps{
		Repo:   repo,
		Config: cfg,
	}

	r.HandleFunc("/health", deps.HealthCheckHandler).Methods("GET")

	r.HandleFunc("/transactions", deps.CreateTransactionHandler).Methods("POST")
	r.HandleFunc("/transactions/{id}", deps.GetTransactionByIDHandler).Methods("GET")
	r.HandleFunc("/transactions", deps.ListTransactionsHandler).Methods("GET")
	r.HandleFunc("/transactions/bulk", deps.BulkAddTransactionsHandler).Methods("POST")
	r.HandleFunc("/transactions/{id}", deps.UpdateTransactionHandler).Methods("PATCH")
	r.HandleFunc("/transactions/{id}", deps.DeleteTransactionHandler).Methods("DELETE")

	c := cors.New(cors.Options{
		AllowedOrigins:   cfg.CorsAllowedOrigins,
		AllowedMethods:   []string{"GET", "POST", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type", "Authorization"},
		AllowCredentials: true,
		Debug:            true,
	})

	handler := c.Handler(r)
	return handler
}
