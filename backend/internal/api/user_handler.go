package api

import (
	"backend/internal/db"
	"backend/internal/models"
	"context"
	"encoding/json"
	"log"
	"net/http"
)

type SetupUserProfileRequest struct {
	UID   string `json:"uid"`
	Email string `json:"email"`
}

type SetupUserProfileDeps struct {
	Repo db.Repository
}

func (deps *SetupUserProfileDeps) SetupUserProfileHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}

	var req SetupUserProfileRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("Invalid request body"))
		return
	}

	log.Printf("Setting up profile for user: %s", req.Email)

	// Seed default categories
	defaultCategories := []models.UserCategory{
		{Name: "Groceries", Keywords: []string{"food", "supermarket", "grocery"}},
		{Name: "Rent", Keywords: []string{"rent", "apartment", "housing"}},
		{Name: "Utilities", Keywords: []string{"electricity", "water", "gas", "utility"}},
		{Name: "Transport", Keywords: []string{"bus", "train", "uber", "taxi", "transport"}},
		{Name: "Entertainment", Keywords: []string{"movie", "cinema", "netflix", "entertainment"}},
		{Name: "Savings", Keywords: []string{"savings", "deposit", "bank"}},
		{Name: "Health", Keywords: []string{"doctor", "pharmacy", "health"}},
		{Name: "Other", Keywords: []string{}},
	}

	ctx := context.Background()
	for _, cat := range defaultCategories {
		err := deps.Repo.SetUserCategory(ctx, req.UID, cat.Name, cat)
		if err != nil {
			log.Printf("Failed to add category %s for user %s: %v", cat.Name, req.UID, err)
			w.WriteHeader(http.StatusInternalServerError)
			w.Write([]byte("Failed to seed categories"))
			return
		}
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("User profile and categories seeded"))
}
