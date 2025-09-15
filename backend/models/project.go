package models

import (
	"encoding/json"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// LocalTime serializza time.Time in formato locale invece che UTC
type LocalTime time.Time

func (lt LocalTime) MarshalJSON() ([]byte, error) {
	return json.Marshal(time.Time(lt).Format("2006-01-02T15:04:05-07:00"))
}

func (lt *LocalTime) UnmarshalJSON(data []byte) error {
	var s string
	if err := json.Unmarshal(data, &s); err != nil {
		return err
	}
	t, err := time.Parse("2006-01-02T15:04:05-07:00", s)
	if err != nil {
		return err
	}
	*lt = LocalTime(t)
	return nil
}

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
