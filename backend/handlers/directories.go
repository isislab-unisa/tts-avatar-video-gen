package handlers

import (
	"context"
	"regexp"
	"strings"

	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"github.com/Antonio-Caiazzo/DUBME/backend/db"
	"github.com/Antonio-Caiazzo/DUBME/backend/models"
	"github.com/Antonio-Caiazzo/DUBME/backend/storage"
)

var dirNameRe = regexp.MustCompile(`^[\w\s\-]+$`)

type dirOut struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

type createBody struct {
	Name string `json:"name"`
}

type dirUpdateBody struct {
	Name *string `json:"name,omitempty"`
}

func EnsureDirectoryIndexes(ctx context.Context) error {
	_, err := db.Col("directories").Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys:    bson.D{{Key: "userId", Value: 1}, {Key: "name", Value: 1}},
		Options: options.Index().SetUnique(true),
	})
	return err
}

func CreateDirectory(c *fiber.Ctx) error {
	userID, _ := c.Locals("userId").(string)
	if strings.TrimSpace(userID) == "" {
		return fiber.NewError(fiber.StatusUnauthorized, "missing user")
	}
	var body createBody
	if err := c.BodyParser(&body); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid body")
	}
	name := strings.TrimSpace(body.Name)
	if l := len(name); l < 2 || l > 40 || !dirNameRe.MatchString(name) {
		return fiber.NewError(fiber.StatusBadRequest, "invalid name")
	}
	doc := models.Directory{UserID: userID, Name: name}
	res, err := db.Col("directories").InsertOne(c.Context(), doc)
	if err != nil {
		if mongo.IsDuplicateKeyError(err) {
			return fiber.NewError(fiber.StatusConflict, "name already exists")
		}
		return fiber.NewError(fiber.StatusInternalServerError, "db error")
	}
	oid := res.InsertedID.(primitive.ObjectID)
	return c.Status(fiber.StatusCreated).JSON(bson.M{"id": oid.Hex(), "name": name})
}

func ListDirectories(c *fiber.Ctx) error {
	userID, _ := c.Locals("userId").(string)
	if strings.TrimSpace(userID) == "" {
		return fiber.NewError(fiber.StatusUnauthorized, "missing user")
	}

	cur, err := db.Col("directories").Find(
		c.Context(),
		bson.M{"userId": userID},
		options.Find().SetSort(bson.D{{Key: "name", Value: 1}}),
	)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "db error")
	}
	defer cur.Close(c.Context())

	var docs []models.Directory
	if err := cur.All(c.Context(), &docs); err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "decode error")
	}
	out := make([]dirOut, 0, len(docs))
	for _, d := range docs {
		out = append(out, dirOut{ID: d.ID.Hex(), Name: d.Name})
	}
	return c.JSON(out)
}

func UpdateDirectory(c *fiber.Ctx) error {
	userID, _ := c.Locals("userId").(string)
	id := c.Params("id")
	oid, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "bad id")
	}

	var body dirUpdateBody
	if err := c.BodyParser(&body); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid body")
	}
	set := bson.M{}
	if body.Name != nil {
		name := strings.TrimSpace(*body.Name)
		if l := len(name); l < 2 || l > 40 || !dirNameRe.MatchString(name) {
			return fiber.NewError(fiber.StatusBadRequest, "invalid name")
		}
		set["name"] = name
	}
	if len(set) == 0 {
		return c.SendStatus(fiber.StatusNoContent)
	}

	_, err = db.Col("directories").UpdateOne(
		c.Context(),
		bson.M{"_id": oid, "userId": userID},
		bson.M{"$set": set},
	)
	if err != nil {
		if mongo.IsDuplicateKeyError(err) {
			return fiber.NewError(fiber.StatusConflict, "name already exists")
		}
		return fiber.NewError(fiber.StatusInternalServerError, "db error")
	}
	return c.SendStatus(fiber.StatusNoContent)
}

/* ====== NUOVO: handler con store per cancellazione a cascata ====== */
type DirectoriesHandler struct {
	Store *storage.MinioStore
}

// DELETE /api/directories/:id  -> rimuove la directory e TUTTI i progetti (e video su MinIO)
func (h *DirectoriesHandler) DeleteDirectory(c *fiber.Ctx) error {
	userID, _ := c.Locals("userId").(string)
	id := c.Params("id")
	oid, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "bad id")
	}

	// trova i progetti della cartella
	cur, err := db.Col("projects").Find(c.Context(), bson.M{"userId": userID, "directoryId": id})
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "db error")
	}
	defer cur.Close(c.Context())

	type proj struct {
		BucketID string `bson:"bucketId"`
	}
	var projs []proj
	for cur.Next(c.Context()) {
		var p proj
		if err := cur.Decode(&p); err == nil && strings.TrimSpace(p.BucketID) != "" {
			projs = append(projs, p)
		}
	}

	// rimozione oggetti su MinIO
	for _, p := range projs {
		_ = h.Store.Remove(c.Context(), p.BucketID)
	}

	// rimuovi progetti e poi directory
	_, _ = db.Col("projects").DeleteMany(c.Context(), bson.M{"userId": userID, "directoryId": id})
	_, err = db.Col("directories").DeleteOne(c.Context(), bson.M{"_id": oid, "userId": userID})
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "db error")
	}
	return c.SendStatus(fiber.StatusNoContent)
}
