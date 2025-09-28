package api

import (
	"backend/internal/analytics"
	"net/http"
)

// ForecastHandler godoc
// @Summary Get spending forecast
// @Description Returns a spending forecast for the next 30 days based on historical transaction data
// @Tags analytics
// @Produce json
// @Success 200 {array} analytics.DailySpend
// @Failure 400 {string} string "Not enough data to generate a forecast"
// @Failure 500 {string} string "Failed to retrieve transactions"
// @Router /analytics/forecast [get]
func (deps *RouterDeps) ForecastHandler(w http.ResponseWriter, r *http.Request) {
	userID := r.Header.Get("user-id")

	transactions, err := deps.Repo.ListTransactions(r.Context(), userID, nil)
	if err != nil {
		http.Error(w, "Failed to retrieve transactions", http.StatusInternalServerError)
		return
	}

	dailySpends := analytics.PrepareForecastData(transactions)
	forecast := analytics.GetPolynomialForecast(dailySpends, 30, 3) // forecast for the next 30 days using a cubic polynomial

	if forecast == nil {
		http.Error(w, "Not enough data to generate a forecast", http.StatusBadRequest)
		return
	}

	EncodeJSONResponse(w, forecast)
}
