package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Project struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID      string             `bson:"userId" json:"userId"`
	Title       string             `bson:"title" json:"title"`
	DirectoryID string             `bson:"directoryId" json:"directoryId"`
	CreatedAt   time.Time          `bson:"createdAt" json:"createdAt"`
	Avatar      string             `bson:"avatar" json:"avatar"`
	AvatarImage string             `bson:"avatarImage" json:"avatarImage"`
	Text        string             `bson:"text" json:"text"`
	BucketID    string             `bson:"bucketId" json:"bucketId"`
}
