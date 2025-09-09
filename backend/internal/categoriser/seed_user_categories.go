package categoriser

import (
	"backend/internal/db"
	"backend/internal/models"
	"context"
)

var defaultCategories = []models.UserCategory{
	{Name: "Housing", Keywords: []string{"rent", "council", "yorkshire water"}},
	{Name: "Transport", Keywords: []string{"tfl", "uber", "petrol", "fuel"}},
	{Name: "Food", Keywords: []string{"marks&spencer", "tesco", "co-op", "sainsburys"}},
	{Name: "Dining", Keywords: []string{"burger king", "mcdonalds", "deliveroo"}},
	{Name: "Bills", Keywords: []string{"apple.com", "amazon prime", "microsoft"}},
}

func SeedDefaultCategories(ctx context.Context, repo db.Repository, userID string) error {
	for _, cat := range defaultCategories {
		_, err := repo.AddUserCategory(ctx, userID, cat)
		if err != nil {
			return err
		}
	}
	return nil
}
