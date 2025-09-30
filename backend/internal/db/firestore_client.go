package db

import (
	"context"
	"fmt"
	"log"

	"cloud.google.com/go/firestore"
	firebase "firebase.google.com/go/v4"
	"google.golang.org/api/option"
)

func NewFirestoreClient(ctx context.Context, projectID, credentialsPath, env string) (*firestore.Client, error) {
	var opts []option.ClientOption

	if env == "development" && credentialsPath != "" {
		opts = append(opts, option.WithCredentialsFile(credentialsPath))
	}

	log.Printf("Running in %s environment", env)

	conf := &firebase.Config{ProjectID: projectID}
	app, err := firebase.NewApp(ctx, conf, opts...)
	if err != nil {
		return nil, fmt.Errorf("firebase.NewApp: %w", err)
	}

	client, err := app.Firestore(ctx)
	if err != nil {
		return nil, fmt.Errorf("app.Firestore: %w", err)
	}
	return client, nil
}

func NewFirestoreRepository(client *firestore.Client) *FirestoreRepository {
	return &FirestoreRepository{client: client}
}
