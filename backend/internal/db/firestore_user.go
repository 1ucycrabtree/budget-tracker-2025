package db

import (
	"context"
	"fmt"
)

func (r *FirestoreRepository) SeedNewUser(ctx context.Context, userID string, userData map[string]interface{}) error {
	userDoc := r.client.Collection("users").Doc(userID)
	_, err := userDoc.Set(ctx, userData)
	if err != nil {
		return fmt.Errorf("failed to seed new user: %w", err)
	}
	return nil
}
