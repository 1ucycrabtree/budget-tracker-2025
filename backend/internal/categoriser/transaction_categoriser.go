package categoriser

import (
	"backend/internal/db"
	"context"
	"strings"
)

func CategoriseTransaction(ctx context.Context, repo db.Repository, userID, description, category string) (string, error) {
	if category != "" {
		return category, nil
	}
	userCategories, err := repo.ListUserCategories(ctx, userID)
	if err != nil {
		return "", err
	}
	descLower := strings.ToLower(description)
	for _, cat := range userCategories {
		for _, kw := range cat.Keywords {
			if strings.Contains(descLower, strings.ToLower(kw)) {
				return cat.Name, nil
			}
		}
	}
	return "Other", nil
}
