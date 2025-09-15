package db

import (
	"backend/internal/models"
	"context"
	"errors"

	"cloud.google.com/go/firestore"
	"google.golang.org/api/iterator"
)

func (r *FirestoreRepository) ListUserCategories(ctx context.Context, userID string) ([]models.UserCategory, error) {
	iter := r.client.Collection("users").Doc(userID).Collection("categories").Documents(ctx)
	defer iter.Stop()

	var categories []models.UserCategory
	for {
		doc, err := iter.Next()
		if err != nil {
			if errors.Is(err, iterator.Done) {
				return categories, nil
			}
			return nil, err
		}
		var cat models.UserCategory
		if err := doc.DataTo(&cat); err != nil {
			return nil, err
		}
		categories = append(categories, cat)
	}
}

func (r *FirestoreRepository) AddUserCategory(ctx context.Context, userID string, category models.UserCategory) (string, error) {
	col := r.client.Collection("users").Doc(userID).Collection("categories")
	ref, _, err := col.Add(ctx, category)
	if err != nil {
		return "", err
	}
	return ref.ID, nil
}

func (r *FirestoreRepository) SetUserCategory(ctx context.Context, userID, categoryName string, category models.UserCategory) error {
	docRef := r.client.Collection("users").Doc(userID).Collection("categories").Doc(categoryName)
	_, err := docRef.Set(ctx, category)
	return err
}

func (r *FirestoreRepository) UpdateUserCategory(ctx context.Context, userID, categoryID string, category models.UserCategory) error {
	docRef := r.client.Collection("users").Doc(userID).Collection("categories").Doc(categoryID)
	_, err := docRef.Set(ctx, category, firestore.MergeAll)
	return err
}

func (r *FirestoreRepository) DeleteUserCategory(ctx context.Context, userID, categoryID string) error {
	docRef := r.client.Collection("users").Doc(userID).Collection("categories").Doc(categoryID)
	_, err := docRef.Delete(ctx)
	return err
}
