package models

type UserCategory struct {
	Name     string   `json:"name" firestore:"name"`
	Keywords []string `json:"keywords" firestore:"keywords"`
}
