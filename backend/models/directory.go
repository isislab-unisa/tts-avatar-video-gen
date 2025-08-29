package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type Directory struct {
	ID     primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID string             `bson:"userId"          json:"userId"`
	Name   string             `bson:"name"            json:"name"`
}
