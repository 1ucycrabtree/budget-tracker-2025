package api

import (
	"backend/internal/categoriser"
	"backend/internal/models"
	"context"
	"encoding/csv"
	"fmt"
	"io"
	"net/http"
	"strconv"
	"strings"
	"time"
)

// ImportTransactionsHandler godoc
// @Summary Import transactions from CSV
// @Description Import transactions for the authenticated user from a CSV file
// @Tags import
// @Accept multipart/form-data
// @Produce json
// @Param user-id header string true "User ID"
// @Param file formData file true "CSV file"
// @Success 200 {array} models.Transaction
// @Failure 400 {string} string "Failed to read file"
// @Failure 401 {string} string "Unauthorized"
// @Failure 500 {string} string "Failed to parse csv or save transactions"
// @Router /import [post]
// @Security ApiKeyAuth
func (deps *RouterDeps) ImportTransactionsHandler(w http.ResponseWriter, r *http.Request) {
	file, _, err := r.FormFile("file")
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to read file: %v", err), http.StatusBadRequest)
		return
	}
	defer file.Close()

	userID := r.Header.Get("user-id")

	transactions, err := ParseCSV(file, userID)
	if err != nil {
		http.Error(w, "failed to parse csv", http.StatusInternalServerError)
		return
	}

	transactions, err = deps.Repo.BulkAddTransactions(context.Background(), transactions)
	if err != nil {
		http.Error(w, "failed to save transactions", http.StatusInternalServerError)
		return
	}

	EncodeJSONResponse(w, transactions)
}

func ParseCSV(r io.Reader, userID string) ([]models.Transaction, error) {
	var transactions []models.Transaction
	csvReader := csv.NewReader(r)
	csvReader.FieldsPerRecord = -1 // handle variable columns

	records, err := csvReader.ReadAll()
	if err != nil {
		return []models.Transaction{}, nil
	}

	for i, record := range records {
		if i == 0 {
			continue // skip header
		}

		if len(record) < 6 {
			continue
		}

		// parse date
		date, err := time.Parse("02/01/2006", record[1])
		if err != nil {
			continue
		}

		// parse amount and convert to int32 (pence)
		amountFloat, err := strconv.ParseFloat(record[3], 64)
		if err != nil {
			continue
		}
		amount := int32(amountFloat * 100)

		t := models.Transaction{
			UserID:              userID,
			TransactionDateTime: date,
			Description:         strings.TrimSpace(record[5]),
			Amount:              amount,
			Category:            string(categoriser.Categorise(record[5])),
			Type:                detectType(amount),
			BankReference:       strings.TrimSpace(record[2]),
			InsertedAt:          time.Now(),
			UpdatedAt:           time.Now(),
		}
		transactions = append(transactions, t)
	}

	return transactions, nil
}

func detectType(amount int32) string {
	switch {
	case amount < 0:
		return "Debit"
	case amount > 0:
		return "Credit"
	default:
		return "-" // shouldn't have zero amounts
	}
}
