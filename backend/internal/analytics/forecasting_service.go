package analytics

import (
	"sort"
	"time"

	"backend/internal/models"

	"gonum.org/v1/gonum/stat"
)

// DailySpend represents the total spend for a specific day.
type DailySpend struct {
	Date  time.Time
	Total float64
}

func PrepareForecastData(transactions []models.Transaction) []DailySpend {
	dailyTotals := make(map[time.Time]float64)

	for _, tx := range transactions {
		if tx.Amount < 0 {
			day := tx.TransactionDateTime.Truncate(24 * time.Hour)
			dailyTotals[day] += float64(-tx.Amount) / 100.0 // Convert pence to pounds
		}
	}

	var result []DailySpend
	for day, total := range dailyTotals {
		result = append(result, DailySpend{Date: day, Total: total})
	}

	sort.Slice(result, func(i, j int) bool {
		return result[i].Date.Before(result[j].Date)
	})

	return result
}

func GetForecast(dailySpends []DailySpend, forecastDays int) []DailySpend {
	if len(dailySpends) < 2 {
		return nil // Not enough data to make a forecast
	}

	var xTime, ySpend []float64
	startDate := dailySpends[0].Date

	for _, ds := range dailySpends {
		daysSinceStart := ds.Date.Sub(startDate).Hours() / 24
		xTime = append(xTime, daysSinceStart)
		ySpend = append(ySpend, ds.Total)
	}

	// linear regression model!
	// alpha is the intercept (spend at day 0)
	// beta is the slope (change in spend per day)
	alpha, beta := stat.LinearRegression(xTime, ySpend, nil, false)

	var forecast []DailySpend
	lastDay := dailySpends[len(dailySpends)-1].Date
	lastDayIndex := lastDay.Sub(startDate).Hours() / 24

	for i := 1; i <= forecastDays; i++ {
		futureDayIndex := lastDayIndex + float64(i)
		predictedSpend := alpha + beta*futureDayIndex

		if predictedSpend < 0 {
			predictedSpend = 0 // No negative spend
		}

		forecast = append(forecast, DailySpend{
			Date:  lastDay.AddDate(0, 0, i),
			Total: predictedSpend,
		})
	}

	return forecast
}
