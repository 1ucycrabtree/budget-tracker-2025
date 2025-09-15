package api

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/gorilla/mux"

	"backend/internal/categoriser"
	"backend/internal/exceptions"
	"backend/internal/models"
)

// CreateTransactionHandler godoc
// @Summary Create a transaction
// @Description Create a new transaction for the authenticated user
// @Tags transactions
// @Accept json
// @Produce json
// @Param user-id header string true "User ID"
// @Param transaction body models.Transaction true "Transaction to create"
// @Success 200 {object} models.Transaction
// @Failure 400 {string} string "Invalid request body"
// @Failure 401 {string} string "Unauthorized"
// @Failure 500 {string} string "Failed to create transaction"
// @Router /transactions [post]
// @Security ApiKeyAuth
func (deps *RouterDeps) CreateTransactionHandler(w http.ResponseWriter, r *http.Request) {
	var transaction models.Transaction
	if err := json.NewDecoder(r.Body).Decode(&transaction); err != nil {
		http.Error(w, fmt.Sprintf("Invalid request body: %v", err), http.StatusBadRequest)
		return
	}

	userID := r.Header.Get("user-id")

	transaction.UserID = userID
	transaction.InsertedAt = time.Now()
	transaction.UpdatedAt = time.Now()

	category, err := categoriser.CategoriseTransaction(r.Context(), deps.Repo, userID, transaction.Description, transaction.Category)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to categorise transaction: %v", err), http.StatusInternalServerError)
		return
	}
	transaction.Category = category

	transactionID, err := deps.Repo.AddTransaction(context.Background(), userID, transaction)
	if err != nil {
		log.Printf("Error adding transaction to DB: %v", err)
		http.Error(w, "Failed to create transaction", http.StatusInternalServerError)
		return
	}

	transaction.ID = transactionID
	transaction.UserID = ""
	EncodeJSONResponse(w, transaction)
}

// GetTransactionByIDHandler godoc
// @Summary Get transaction by ID
// @Description Get a transaction by its ID for the authenticated user
// @Tags transactions
// @Produce json
// @Param user-id header string true "User ID"
// @Param id path string true "Transaction ID"
// @Success 200 {object} models.Transaction
// @Failure 400 {string} string "Missing transaction ID"
// @Failure 401 {string} string "Unauthorized"
// @Failure 403 {string} string "Forbidden"
// @Failure 404 {string} string "Transaction not found"
// @Router /transactions/{id} [get]
// @Security ApiKeyAuth
func (deps *RouterDeps) GetTransactionByIDHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	transactionID := vars["id"]
	if transactionID == "" {
		http.Error(w, "Missing transaction ID", http.StatusBadRequest)
		return
	}

	userID := r.Header.Get("user-id")

	transaction, err := deps.Repo.GetTransactionByID(context.Background(), userID, transactionID)
	if err != nil {
		var forbiddenErr *exceptions.UserForbiddenError
		if errors.As(err, &forbiddenErr) {
			log.Print(exceptions.UserForbidden(userID))
			http.Error(w, "", http.StatusForbidden)
			return
		}
		var notFoundErr *exceptions.TransactionNotFoundError
		if errors.As(err, &notFoundErr) {
			log.Print(exceptions.TransactionNotFound(transactionID))
			http.Error(w, "transaction not found", http.StatusNotFound)
			return
		}
		log.Printf("Error getting transaction: %v", err)
		http.Error(w, "Transaction not found", http.StatusNotFound)
		return
	}

	EncodeJSONResponse(w, transaction)

}

// ListTransactionsHandler godoc
// @Summary List transactions
// @Description List transactions for the authenticated user, optionally filtered
// @Tags transactions
// @Produce json
// @Param user-id header string true "User ID"
// @Param filters query string false "Filters (key=value)"
// @Success 200 {array} models.Transaction
// @Failure 401 {string} string "Unauthorized"
// @Failure 500 {string} string "Failed to list transactions"
// @Router /transactions [get]
// @Security ApiKeyAuth
func (deps *RouterDeps) ListTransactionsHandler(w http.ResponseWriter, r *http.Request) {
	filters := make(map[string]string)
	for key, values := range r.URL.Query() {
		if len(values) > 0 {
			filters[key] = values[0]
		}
	}

	userID := r.Header.Get("user-id")

	transactions, err := deps.Repo.ListTransactions(context.Background(), userID, filters)
	if err != nil {
		log.Printf("Error listing transactions: %v", err)
		http.Error(w, "Failed to list transactions", http.StatusInternalServerError)
		return
	}

	EncodeJSONResponse(w, transactions)
}

// BulkAddTransactionsHandler godoc
// @Summary Bulk add transactions
// @Description Add multiple transactions for the authenticated user
// @Tags transactions
// @Accept json
// @Produce json
// @Param user-id header string true "User ID"
// @Param transactions body []models.Transaction true "Transactions to add"
// @Success 200 {array} models.Transaction
// @Failure 400 {string} string "Invalid request body"
// @Failure 401 {string} string "Unauthorized"
// @Failure 500 {string} string "Failed to bulk add transactions"
// @Router /transactions/bulk [post]
// @Security ApiKeyAuth
func (deps *RouterDeps) BulkAddTransactionsHandler(w http.ResponseWriter, r *http.Request) {
	var transactions []models.Transaction
	if err := json.NewDecoder(r.Body).Decode(&transactions); err != nil {
		http.Error(w, fmt.Sprintf("Invalid request body: %v", err), http.StatusBadRequest)
		return
	}

	userID := r.Header.Get("user-id")

	for i := range transactions {
		transactions[i].UserID = userID
		transactions[i].InsertedAt = time.Now()
		transactions[i].UpdatedAt = time.Now()
	}

	transactions, err := deps.Repo.BulkAddTransactions(context.Background(), transactions)
	if err != nil {
		log.Printf("Error bulk adding transactions: %v", err)
		http.Error(w, "Failed to bulk add transactions", http.StatusInternalServerError)
		return
	}

	EncodeJSONResponse(w, transactions)
}

// UpdateTransactionHandler godoc
// @Summary Update a transaction
// @Description Update an existing transaction for the authenticated user
// @Tags transactions
// @Accept json
// @Produce json
// @Param user-id header string true "User ID"
// @Param id path string true "Transaction ID"
// @Param transaction body models.TransactionUpdate true "Transaction update data"
// @Success 200 {object} models.Transaction
// @Failure 400 {string} string "Missing transaction ID or invalid request body"
// @Failure 401 {string} string "Unauthorized"
// @Failure 403 {string} string "Forbidden"
// @Failure 404 {string} string "Transaction not found"
// @Failure 500 {string} string "Failed to update transaction"
// @Router /transactions/{id} [put]
// @Security ApiKeyAuth
func (deps *RouterDeps) UpdateTransactionHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	transactionID := vars["id"]
	if transactionID == "" {
		http.Error(w, "Missing transaction ID", http.StatusBadRequest)
		return
	}

	userID := r.Header.Get("user-id")

	var updateData models.TransactionUpdate
	if err := json.NewDecoder(r.Body).Decode(&updateData); err != nil {
		http.Error(w, fmt.Sprintf("Invalid request body: %v", err), http.StatusBadRequest)
		return
	}

	transaction, err := deps.Repo.UpdateTransaction(context.Background(), userID, transactionID, updateData)
	if err != nil {
		var forbiddenErr *exceptions.UserForbiddenError
		if errors.As(err, &forbiddenErr) {
			log.Print(exceptions.UserForbidden(userID))
			http.Error(w, "", http.StatusForbidden)
			return
		}
		var notFoundErr *exceptions.TransactionNotFoundError
		if errors.As(err, &notFoundErr) {
			log.Print(exceptions.TransactionNotFound(transactionID))
			http.Error(w, "transaction not found", http.StatusNotFound)
			return
		}
		log.Printf("Error updating transaction: %v", err)
		http.Error(w, "Failed to update transaction", http.StatusInternalServerError)
		return
	}

	EncodeJSONResponse(w, transaction)
}

// DeleteTransactionHandler godoc
// @Summary Delete a transaction
// @Description Delete a transaction for the authenticated user
// @Tags transactions
// @Produce json
// @Param user-id header string true "User ID"
// @Param id path string true "Transaction ID"
// @Success 200 {string} string "OK"
// @Failure 400 {string} string "Missing transaction ID"
// @Failure 401 {string} string "Unauthorized"
// @Failure 403 {string} string "Forbidden"
// @Failure 404 {string} string "Transaction not found"
// @Failure 500 {string} string "Failed to delete transaction"
// @Router /transactions/{id} [delete]
// @Security ApiKeyAuth
func (deps *RouterDeps) DeleteTransactionHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	transactionID := vars["id"]
	if transactionID == "" {
		http.Error(w, "Missing transaction ID", http.StatusBadRequest)
		return
	}

	userID := r.Header.Get("user-id")

	if err := deps.Repo.DeleteTransaction(context.Background(), userID, transactionID); err != nil {
		var forbiddenErr *exceptions.UserForbiddenError
		if errors.As(err, &forbiddenErr) {
			log.Print(exceptions.UserForbidden(userID))
			http.Error(w, "", http.StatusForbidden)
			return
		}
		var notFoundErr *exceptions.TransactionNotFoundError
		if errors.As(err, &notFoundErr) {
			log.Print(exceptions.TransactionNotFound(transactionID))
			http.Error(w, "transaction not found", http.StatusNotFound)
			return
		}
		log.Printf("Error deleting transaction: %v", err)
		http.Error(w, "Failed to delete transaction", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}
