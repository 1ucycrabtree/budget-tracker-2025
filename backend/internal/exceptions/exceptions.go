package exceptions

import (
	"fmt"
)

// TransactionNotFoundError is returned when a transaction is not found.
type TransactionNotFoundError struct {
	TransactionID string
}

func (e *TransactionNotFoundError) Error() string {
	return fmt.Sprintf("transaction '%s' not found", e.TransactionID)
}

func TransactionNotFound(transactionID string) error {
	return &TransactionNotFoundError{TransactionID: transactionID}
}

// UserForbiddenError  is returned when the user is forbidden from accessing a resource.
type UserForbiddenError struct {
	UserID string
}

func (e *UserForbiddenError) Error() string {
	return fmt.Sprintf("user '%s' is forbidden from accessing this resource", e.UserID)
}

func UserForbidden(userID string) error {
	return &UserForbiddenError{UserID: userID}
}
