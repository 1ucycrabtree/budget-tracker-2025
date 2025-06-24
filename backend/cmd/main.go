package main

import (
	"cloud.google.com/go/firestore"
	"context"
	"errors"
	"log"
	"net/http"
	"os"
	"os/signal"
	"time"

	"backend/internal/api"
	"backend/internal/db"
	config "backend/internal/setup"
)

func main() {
	ctx := context.Background()

	cfg := config.LoadConfig()

	firestoreClient, err := db.NewFirestoreClient(ctx, cfg.FirestoreCredentialsPath)
	if err != nil {
		log.Fatalf("Failed to create Firestore client: %v", err)
	}
	repo := db.NewFirestoreRepository(firestoreClient)

	router := api.NewRouter(repo, cfg)
	if router == nil {
		log.Fatal("Failed to create router")
	}

	defer func(firestoreClient *firestore.Client) {
		err := firestoreClient.Close()
		if err != nil {
			log.Printf("Error closing Firestore client: %v", err)
		} else {
			log.Println("Firestore client closed successfully.")
		}
	}(firestoreClient)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	server := &http.Server{
		Addr:         ":" + port,
		Handler:      router,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
		IdleTimeout:  120 * time.Second,
	}

	go func() {
		log.Printf("Server listening on %s", server.Addr)
		if err := server.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Fatalf("Server failed to listen: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt)
	<-quit

	log.Println("Shutting down server...")
	ctxTimeout, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := server.Shutdown(ctxTimeout); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}
}
