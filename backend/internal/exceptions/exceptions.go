package exceptions

import (
	"fmt"
)

const (
	MissingTransactionIDMessage        = "missing transaction ID"
	InvalidRequestBodyMessage          = "invalid request body: %v"
	FailedToCategoriseMessage          = "failed to categorise transaction: %v"
	FailedToCreateTransactionMessage   = "failed to create transaction"
	FailedToBulkAddTransactionsMessage = "failed to bulk add transactions"
	FailedToListTransactionsMessage    = "failed to list transactions"
	TransactionNotFoundMessage         = "transaction not found"
	FailedToGetTransactionMessage      = "failed to get transaction: %w"
	FailedToUpdateTransactionMessage   = "failed to update transaction: %w"
	FailedToDeleteTransactionMessage   = "failed to delete transaction: %w"
	UserForbiddenMessage               = "user is forbidden from accessing this resource"
	FailedToReadMessage                = "failed to read file: %v"
	FailedToParseMessage               = "failed to parse data: %v"
)

// TransactionNotFoundError is returned when a transaction is not found.
type TransactionNotFoundError struct {
	TransactionID string
}

func (e *TransactionNotFoundError) Error() string {
	return fmt.Sprintf("%s: %s", TransactionNotFoundMessage, e.TransactionID)
}

func TransactionNotFound(transactionID string) error {
	return &TransactionNotFoundError{TransactionID: transactionID}
}

// UserForbiddenError  is returned when the user is forbidden from accessing a resource.
type UserForbiddenError struct {
	UserID string
}

func (e *UserForbiddenError) Error() string {
	return fmt.Sprintf("%s: %s", UserForbiddenMessage, e.UserID)
}

func UserForbidden(userID string) error {
	return &UserForbiddenError{UserID: userID}
}
