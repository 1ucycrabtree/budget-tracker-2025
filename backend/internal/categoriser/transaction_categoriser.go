package categoriser

import "strings"

type Category string

const (
	Housing   Category = "Housing"
	Transport Category = "Transport"
	Food      Category = "Food"
	Dining    Category = "Dining"
	Bills     Category = "Bills"
	Other     Category = "Other"
)

var CategoryMap = map[string]Category{
	"rent":               Housing,
	"council":            Housing,
	"tfl":                Transport,
	"west midlands rail": Transport,
	"uber":               Transport,
	"marks&spencer":      Food,
	"tesco":              Food,
	"co-op":              Food,
	"sainsburys":         Food,
	"m&s simply food":    Food,
	"burger king":        Dining,
	"mcdonalds":          Dining,
	"deliveroo":          Dining,
	"pret a manger":      Dining,
	"bistro":             Dining,
	"giardino":           Dining,
	"apple.com":          Bills,
	"amazon prime":       Bills,
	"microsoft":          Bills,
	"yorkshire water":    Housing,
	"david lloyd":        Bills,
	"petrol":             Transport,
	"fuel":               Transport,
}

func Categorise(description string) Category {
	desc := strings.ToLower(description)

	for keyword, category := range CategoryMap {
		if strings.Contains(desc, keyword) {
			return category
		}
	}

	return Other
}
