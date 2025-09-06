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

func (deps *RouterDeps) ImportTransactionsHandler(w http.ResponseWriter, r *http.Request) {
	file, _, err := r.FormFile("file")
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to read file: %v", err), http.StatusBadRequest)
		return
	}
	defer file.Close()

	userID, ok := GetUserIDFromHeader(w, r)
	if !ok {
		return
	}

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
		return nil, err
	}

	for i, record := range records {
		if i == 0 {
			continue // skip header
		}

		// Parse date
		date, err := time.Parse("02/01/2006", record[1])
		if err != nil {
			continue
		}

		// Parse amount and convert to int32 (pence)
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
