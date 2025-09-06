package api

import (
	"encoding/json"
	"net/http"
)

func GetUserIDFromHeader(w http.ResponseWriter, r *http.Request) (string, bool) {
	userID := r.Header.Get("user-id")
	if userID == "" {
		http.Error(w, "Missing 'user-id' header", http.StatusBadRequest)
		return "", false
	}
	return userID, true
}

func EncodeJSONResponse(w http.ResponseWriter, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(data); err != nil {
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
	}
}
