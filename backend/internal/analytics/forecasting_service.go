package analytics

import (
	"sort"
	"time"

	"backend/internal/models"

	"github.com/aclements/go-moremath/fit"
	"gonum.org/v1/gonum/stat"
)

// DailySpend represents the total spend for a specific day
type DailySpend struct {
	Date  time.Time
	Total float64
}

type EnhancedDailySpend struct {
	Date        time.Time
	Total       float64
	DayOfWeek   int // 0=Sunday => 6=Saturday
	DayOfMonth  int // 1-31
	DayOfYear   int // 1-366
	IsWeekend   bool
	IsPayday    bool    // You can set this based on your salary schedule
	MovingAvg7  float64 // 7-day moving average
	MovingAvg30 float64 // 30-day moving average
}

type ExponentialSmoothingParams struct {
	Level     float64
	Trend     float64
	Seasonal  []float64
	Alpha     float64
	Beta      float64
	Gamma     float64
	SeasonLen int
}

func PrepareForecastData(transactions []models.Transaction) []DailySpend {
	dailyTotals := make(map[time.Time]float64)

	for _, tx := range transactions {
		if tx.Amount < 0 {
			day := tx.TransactionDateTime.Truncate(24 * time.Hour)
			dailyTotals[day] += float64(-tx.Amount) / 100.0 // convert pence to pounds
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

func PreparedEnhancedForecastData(transactions []models.Transaction) []EnhancedDailySpend {
	dailyTotals := make(map[time.Time]float64)

	for _, tx := range transactions {
		if tx.Amount < 0 {
			day := tx.TransactionDateTime.Truncate(24 * time.Hour)
			dailyTotals[day] += float64(-tx.Amount) / 100.0 // convert pence to pounds
		}
	}

	var result []EnhancedDailySpend
	for day, total := range dailyTotals {
		result = append(result, EnhancedDailySpend{
			Date:       day,
			Total:      total,
			DayOfWeek:  int(day.Weekday()),
			DayOfMonth: day.Day(),
			DayOfYear:  day.YearDay(),
			IsWeekend:  day.Weekday() == time.Saturday || day.Weekday() == time.Sunday,
			IsPayday:   isPayday(day),
		})
	}

	sort.Slice(result, func(i, j int) bool {
		return result[i].Date.Before(result[j].Date)
	})

	for i := range result {
		result[i].MovingAvg7 = calculateMovingAverage(result, i, 7)
		result[i].MovingAvg30 = calculateMovingAverage(result, i, 30)
	}
	return result
}

func isPayday(date time.Time) bool {
	lastDayOfMonth := time.Date(date.Year(), date.Month()+1, 0, 0, 0, 0, 0, date.Location())
	lastFriday := lastDayOfMonth
	for lastFriday.Weekday() != time.Friday {
		lastFriday = lastFriday.AddDate(0, 0, -1)
	}
	return date.Equal(lastFriday)
}

func calculateMovingAverage(data []EnhancedDailySpend, index int, window int) float64 {
	if index < window-1 {
		return data[index].Total
	}
	sum := 0.0
	for i := index - window + 1; i <= index; i++ {
		sum += data[i].Total
	}
	return sum / float64(window)
}

func GetHoltWintersForecast(dailySpends []EnhancedDailySpend, forecastDays, seasonLen int) []DailySpend {
	if len(dailySpends) < 2*seasonLen {
		return nil // not enough data to make a forecast
	}

	state := initializeHoltWinters(dailySpends, seasonLen)
	for i := seasonLen; i < len(dailySpends); i++ {
		updateHoltWinters(&state, dailySpends[i].Total, i)
	}

	var forecast []DailySpend
	lastDay := dailySpends[len(dailySpends)-1].Date

	for i := 1; i <= forecastDays; i++ {
		m := float64(i)
		seasonalIndex := (len(dailySpends) + i - 1) % seasonLen
		predictedSpend := state.Level + m*state.Trend + state.Seasonal[seasonalIndex]

		if predictedSpend < 0 {
			predictedSpend = 0
		}

		forecast = append(forecast, DailySpend{
			Date:  lastDay.AddDate(0, 0, i),
			Total: predictedSpend,
		})
	}

	return forecast
}

func initializeHoltWinters(data []EnhancedDailySpend, seasonLength int) ExponentialSmoothingParams {
	level := 0.0
	for i := 0; i < seasonLength; i++ {
		level += data[i].Total
	}
	level /= float64(seasonLength)

	trend1 := 0.0
	trend2 := 0.0
	for i := range seasonLength {
		trend1 += data[i].Total
		trend2 += data[i+seasonLength].Total
	}
	trend := (trend2 - trend1) / float64(seasonLength*seasonLength)

	seasonal := make([]float64, seasonLength)
	for i := range seasonLength {
		seasonal[i] = data[i].Total - level
	}

	return ExponentialSmoothingParams{
		Level:     level,
		Trend:     trend,
		Seasonal:  seasonal,
		Alpha:     0.3, // how quickly to adapt to new spending levels
		Beta:      0.1, // how quickly to adapt to trend changes
		Gamma:     0.1, // how quickly to adapt seasonal patterns
		SeasonLen: seasonLength,
	}
}

func updateHoltWinters(state *ExponentialSmoothingParams, observation float64, t int) {
	seasonIndex := (t - state.SeasonLen) % state.SeasonLen

	newLevel := state.Alpha*(observation-state.Seasonal[seasonIndex]) +
		(1-state.Alpha)*(state.Level+state.Trend)

	newTrend := state.Beta*(newLevel-state.Level) + (1-state.Beta)*state.Trend

	state.Seasonal[seasonIndex] = state.Gamma*(observation-newLevel) +
		(1-state.Gamma)*state.Seasonal[seasonIndex]

	state.Level = newLevel
	state.Trend = newTrend
}

func GetPolynomialForecast(dailySpends []DailySpend, forecastDays int, degree int) []DailySpend {
	if len(dailySpends) < degree+1 {
		return nil // not enough data to make a forecast
	}

	var xTime, ySpend []float64
	startDate := dailySpends[0].Date

	for _, dailySpend := range dailySpends {
		daysSinceStart := dailySpend.Date.Sub(startDate).Hours() / 24
		xTime = append(xTime, daysSinceStart)
		ySpend = append(ySpend, dailySpend.Total)
	}

	poly := fit.PolynomialRegression(xTime, ySpend, nil, degree)

	var forecast []DailySpend
	lastDay := dailySpends[len(dailySpends)-1].Date
	lastDayIndex := lastDay.Sub(startDate).Hours() / 24

	for i := 1; i <= forecastDays; i++ {
		futureDayIndex := lastDayIndex + float64(i)

		predictedSpend := poly.F(futureDayIndex)

		if predictedSpend < 0 {
			predictedSpend = 0
		}

		forecast = append(forecast, DailySpend{
			Date:  lastDay.AddDate(0, 0, i),
			Total: predictedSpend,
		})
	}

	return forecast
}

func GetLinearForecast(dailySpends []DailySpend, forecastDays int) []DailySpend {
	if len(dailySpends) < 2 {
		return nil // not enough data to make a forecast
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
			predictedSpend = 0 // no negative spend
		}

		forecast = append(forecast, DailySpend{
			Date:  lastDay.AddDate(0, 0, i),
			Total: predictedSpend,
		})
	}

	return forecast
}
