package api

import (
	"backend/internal/models"
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
)

func (deps *RouterDeps) ListCategoriesHandler(w http.ResponseWriter, r *http.Request) {
	userID, ok := GetUserIDFromHeader(w, r)
	if !ok {
		return
	}

	categories, err := deps.Repo.ListUserCategories(r.Context(), userID)
	if err != nil {
		http.Error(w, "Failed to list categories", http.StatusInternalServerError)
		return
	}

	EncodeJSONResponse(w, categories)
}

func (deps *RouterDeps) AddCategoryHandler(w http.ResponseWriter, r *http.Request) {
	var category models.UserCategory
	if err := json.NewDecoder(r.Body).Decode(&category); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	userID, ok := GetUserIDFromHeader(w, r)
	if !ok {
		return
	}

	categoryID, err := deps.Repo.AddUserCategory(r.Context(), userID, category)
	if err != nil {
		http.Error(w, "Failed to add category", http.StatusInternalServerError)
		return
	}

	response := map[string]string{"id": categoryID}
	EncodeJSONResponse(w, response)
}

func (deps *RouterDeps) UpdateCategoryHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	categoryID := vars["id"]
	if categoryID == "" {
		http.Error(w, "Missing category ID", http.StatusBadRequest)
		return
	}

	var category models.UserCategory
	if err := json.NewDecoder(r.Body).Decode(&category); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	userID, ok := GetUserIDFromHeader(w, r)
	if !ok {
		return
	}

	if err := deps.Repo.UpdateUserCategory(r.Context(), userID, categoryID, category); err != nil {
		http.Error(w, "Failed to update category", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (deps *RouterDeps) DeleteCategoryHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	categoryID := vars["id"]
	if categoryID == "" {
		http.Error(w, "Missing category ID", http.StatusBadRequest)
		return
	}

	userID, ok := GetUserIDFromHeader(w, r)
	if !ok {
		return
	}

	if err := deps.Repo.DeleteUserCategory(r.Context(), userID, categoryID); err != nil {
		http.Error(w, "Failed to delete category", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
