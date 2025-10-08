package db

import (
	"backend/internal/models"
	"context"

	"cloud.google.com/go/firestore"
)

type Repository interface {
	AddTransaction(ctx context.Context, userID string, transaction models.Transaction) (string, error)
	GetTransactionByID(ctx context.Context, userID, transactionID string) (*models.Transaction, error)
	ListTransactions(ctx context.Context, userID string, filters map[string]string) ([]models.Transaction, error)
	BulkAddTransactions(ctx context.Context, userID string, transactions []models.Transaction) ([]models.Transaction, error)
	UpdateTransaction(ctx context.Context, userID, transactionID string, updateData models.TransactionUpdate) (*models.Transaction, error)
	DeleteTransaction(ctx context.Context, userID, transactionID string) error

	ListUserCategories(ctx context.Context, userID string) ([]models.UserCategory, error)
	AddUserCategory(ctx context.Context, userID string, category models.UserCategory) (string, error)
	UpdateUserCategory(ctx context.Context, userID, categoryID string, category models.UserCategory) error
	DeleteUserCategory(ctx context.Context, userID, categoryID string) error
}

type FirestoreRepository struct {
	client *firestore.Client
}
