package db

import (
	"cloud.google.com/go/firestore"
	"context"
	firebase "firebase.google.com/go/v4"
	"fmt"
	"google.golang.org/api/option"
	"log"
)

func NewFirestoreClient(ctx context.Context, projectID, credentialsPath, env string) (*firestore.Client, error) {
	var opts []option.ClientOption

	if env == "development" && credentialsPath != "" {
		opts = append(opts, option.WithCredentialsFile(credentialsPath))
	} else {
		opts = append(opts, option.WithoutAuthentication())
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
