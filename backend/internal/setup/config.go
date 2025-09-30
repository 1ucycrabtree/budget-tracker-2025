package setup

import (
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
)

type AppConfig struct {
	ProjectID            string
	LocalCredentialsPath string
	CorsAllowedOrigins   []string
	Environment          string
}

func LoadConfig() *AppConfig {
	err := godotenv.Load()
	if err != nil {
		fmt.Println("No .env file found, using environment variables")
	}

	cfg := &AppConfig{
		ProjectID:            getEnv("GCP_PROJECT_ID", ""),
		LocalCredentialsPath: getEnv("LOCAL_CREDENTIAL_PATH", ""),
		CorsAllowedOrigins:   parseCSVEnv("CORS_ALLOWED_ORIGINS", "http://localhost:8080,http://localhost:5173"),
		Environment:          getEnv("ENVIRONMENT", "development"),
	}

	fmt.Printf("Loaded config: ProjectID=%s, LocalCredentialsPath=%s, Environment=%s\n", cfg.ProjectID, cfg.LocalCredentialsPath, cfg.Environment)

	if cfg.ProjectID == "" {
		log.Fatal("Project ID is not set in the environment variables or .env file")
	}

	return cfg
}

func getEnv(key string, defaultValue string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultValue
}

func parseCSVEnv(key, defaultValue string) []string {
	value := getEnv(key, defaultValue)
	if value == "" {
		return []string{}
	}
	return splitString(value, ",")
}

func splitString(s, sep string) []string {
	var parts []string
	currentPart := ""
	for _, r := range s {
		if string(r) == sep {
			parts = append(parts, currentPart)
			currentPart = ""
		} else {
			currentPart += string(r)
		}
	}
	parts = append(parts, currentPart)
	return parts
}
