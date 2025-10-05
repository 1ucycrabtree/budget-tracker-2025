package api

import (
	"backend/internal/models"
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
)

// ListCategoriesHandler godoc
// @Summary List user categories
// @Description Get all categories for the authenticated user
// @Tags categories
// @Produce json
// @Param user-id header string true "User ID"
// @Success 200 {array} models.UserCategory
// @Failure 401 {string} string "Unauthorized"
// @Failure 500 {string} string "Failed to list categories"
// @Router /categories [get]
// @Security ApiKeyAuth
func (deps *RouterDeps) ListCategoriesHandler(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(userIDKey).(string)

	categories, err := deps.Repo.ListUserCategories(r.Context(), userID)
	if err != nil {
		http.Error(w, "Failed to list categories", http.StatusInternalServerError)
		return
	}

	EncodeJSONResponse(w, categories)
}

// AddCategoryHandler godoc
// @Summary Add a new category
// @Description Add a new category for the authenticated user
// @Tags categories
// @Accept json
// @Produce json
// @Param user-id header string true "User ID"
// @Param category body models.UserCategory true "Category to add"
// @Success 200 {object} map[string]string
// @Failure 400 {string} string "Invalid request body"
// @Failure 401 {string} string "Unauthorized"
// @Failure 500 {string} string "Failed to add category"
// @Router /categories [post]
// @Security ApiKeyAuth
func (deps *RouterDeps) AddCategoryHandler(w http.ResponseWriter, r *http.Request) {
	var category models.UserCategory
	if err := json.NewDecoder(r.Body).Decode(&category); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	userID := r.Context().Value(userIDKey).(string)

	categoryID, err := deps.Repo.AddUserCategory(r.Context(), userID, category)
	if err != nil {
		http.Error(w, "Failed to add category", http.StatusInternalServerError)
		return
	}

	response := map[string]string{"id": categoryID}
	EncodeJSONResponse(w, response)
}

// UpdateCategoryHandler godoc
// @Summary Update a category
// @Description Update an existing category for the authenticated user
// @Tags categories
// @Accept json
// @Produce json
// @Param user-id header string true "User ID"
// @Param id path string true "Category ID"
// @Param category body models.UserCategory true "Updated category"
// @Success 204 {string} string "No Content"
// @Failure 400 {string} string "Missing category ID or invalid request body"
// @Failure 401 {string} string "Unauthorized"
// @Failure 500 {string} string "Failed to update category"
// @Router /categories/{id} [put]
// @Security ApiKeyAuth
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

	userID := r.Context().Value(userIDKey).(string)

	if err := deps.Repo.UpdateUserCategory(r.Context(), userID, categoryID, category); err != nil {
		http.Error(w, "Failed to update category", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// DeleteCategoryHandler godoc
// @Summary Delete a category
// @Description Delete a category for the authenticated user
// @Tags categories
// @Produce json
// @Param user-id header string true "User ID"
// @Param id path string true "Category ID"
// @Success 204 {string} string "No Content"
// @Failure 400 {string} string "Missing category ID"
// @Failure 401 {string} string "Unauthorized"
// @Failure 500 {string} string "Failed to delete category"
// @Router /categories/{id} [delete]
// @Security ApiKeyAuth
func (deps *RouterDeps) DeleteCategoryHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	categoryID := vars["id"]
	if categoryID == "" {
		http.Error(w, "Missing category ID", http.StatusBadRequest)
		return
	}

	userID := r.Context().Value(userIDKey).(string)

	if err := deps.Repo.DeleteUserCategory(r.Context(), userID, categoryID); err != nil {
		http.Error(w, "Failed to delete category", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
