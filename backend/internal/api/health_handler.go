package api

import (
	"encoding/json"
	"net/http"
)

// HealthCheckHandler godoc
// @Summary Health check
// @Description Returns the health status of the API
// @Tags health
// @Produce json
// @Success 200 {object} map[string]string
// @Failure 500 {string} string "Failed to encode response"
// @Router /health [get]
func (*RouterDeps) HealthCheckHandler(w http.ResponseWriter, r *http.Request) {
	response := map[string]string{
		"status": "healthy",
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(response); err != nil {
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
	}
}
