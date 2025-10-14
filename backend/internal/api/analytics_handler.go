package api

import (
	"backend/internal/analytics"
	"bytes"
	"encoding/json"
	"net/http"
)

// The request body we will send to the Python forecasting service.
type ForecastRequest struct {
	UserID      string                   `json:"userId"`
	Category    string                   `json:"category"`
	History     []analytics.HistoryPoint `json:"history"`
	MonthsAhead int                      `json:"months_ahead"`
}

// ForecastMonthlyHandler godoc
// @Summary Get spending forecast
// @Description Returns a spending forecast for the next 3 months based on historical transaction data
// @Tags analytics
// @Produce json
// @Success 200 {array} analytics.DailySpend
// @Failure 400 {string} string "Not enough data to generate a forecast"
// @Failure 500 {string} string "Failed to retrieve transactions or get forecast"
// @Router /forecast/monthly [get]
func (deps *RouterDeps) ForecastMonthlyHandler(w http.ResponseWriter, r *http.Request) {
	userID := r.Header.Get("user-id")

	transactions, err := deps.Repo.ListTransactions(r.Context(), userID, nil)
	if err != nil {
		http.Error(w, "Failed to retrieve transactions", http.StatusInternalServerError)
		return
	}

	if len(transactions) == 0 {
		http.Error(w, "No transactions found for user", http.StatusBadRequest)
		return
	}

	history := analytics.PrepareHistory(transactions)

	forecastReq := ForecastRequest{
		UserID:      userID,
		Category:    "all",
		History:     history,
		MonthsAhead: 3,
	}

	reqBody, err := json.Marshal(forecastReq)
	if err != nil {
		http.Error(w, "Failed to create forecast request", http.StatusInternalServerError)
		return
	}

	forecast, err := analytics.GetForecastFromService(r.Context(), bytes.NewBuffer(reqBody))
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if forecast == nil {
		http.Error(w, "Not enough data to generate a forecast", http.StatusBadRequest)
		return
	}

	EncodeJSONResponse(w, forecast)
}
