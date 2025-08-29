package db

import (
	"context"
	"errors"
	"log"
	"net/url"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var client *mongo.Client
var database *mongo.Database

func Connect() error {
	uri := os.Getenv("MONGO_URI")
	if uri == "" {
		uri = "mongodb://127.0.0.1:27017" // fallback
	}

	// Valida lo schema
	u, err := url.Parse(uri)
	if err != nil {
		return err
	}
	if u.Scheme != "mongodb" && u.Scheme != "mongodb+srv" {
		return errors.New(`invalid MONGO_URI: scheme must be "mongodb" or "mongodb+srv"`)
	}

	dbName := os.Getenv("MONGO_DB")
	if dbName == "" {
		dbName = "dubme"
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	cl, err := mongo.Connect(ctx, options.Client().ApplyURI(uri))
	if err != nil {
		return err
	}
	if err := cl.Ping(ctx, nil); err != nil {
		return err
	}

	client = cl
	database = cl.Database(dbName)
	log.Printf("[mongo] connected to %s (host=%s)\n", dbName, u.Host)
	return nil
}

func Col(name string) *mongo.Collection {
	return database.Collection(name)
}
