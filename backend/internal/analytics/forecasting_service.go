package analytics

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"backend/internal/models"
	config "backend/internal/setup"

	"google.golang.org/api/idtoken"
)

type HistoryPoint struct {
	Date   string  `json:"date"` // YYYY-MM-DD
	Amount float64 `json:"amount"`
}

type ForecastResponse struct {
	Dates       []string  `json:"dates"`
	Predictions []float64 `json:"predictions"`
}

func PrepareHistory(transactions []models.Transaction) []HistoryPoint {
	var history []HistoryPoint
	for _, tx := range transactions {
		// only include expenses
		if tx.Amount < 0 {
			history = append(history, HistoryPoint{
				Date:   tx.TransactionDateTime.Format("2006-01-02"),
				Amount: float64(-tx.Amount) / 100.0, // transform amount to positive pounds
			})
		}
	}
	return history
}

func GetForecastFromService(ctx context.Context, body io.Reader) (*ForecastResponse, error) {
	cfg := config.LoadConfig()

	targetURL := cfg.ForecastingServiceURL

	var client *http.Client
	var err error
	if cfg.Environment == "development" {
		client = &http.Client{}
	} else {
		client, err = idtoken.NewClient(ctx, targetURL)
		if err != nil {
			return nil, fmt.Errorf("failed to create idtoken client: %w", err)
		}
	}

	resp, err := client.Post(fmt.Sprintf("%s/forecast/monthly", targetURL), "application/json", body)
	if err != nil {
		return nil, fmt.Errorf("failed to make authenticated request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		respBody, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("forecasting service returned status %d: %s", resp.StatusCode, string(respBody))
	}

	var forecast ForecastResponse
	if err := json.NewDecoder(resp.Body).Decode(&forecast); err != nil {
		return nil, fmt.Errorf("failed to decode forecast response: %w", err)
	}

	return &forecast, nil
}
