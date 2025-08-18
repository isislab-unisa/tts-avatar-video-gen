package handlers

import (
	"context"
	"regexp"
	"strings"

	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"github.com/Antonio-Caiazzo/DUBME/backend/db"
	"github.com/Antonio-Caiazzo/DUBME/backend/models"
)

var dirNameRe = regexp.MustCompile(`^[\w\s\-]+$`)

type dirOut struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

type createBody struct {
	Name string `json:"name"`
}

// Indici unici (userId + name)
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
	if _, err := db.Col("directories").InsertOne(c.Context(), doc); err != nil {
		if mongo.IsDuplicateKeyError(err) {
			return fiber.NewError(fiber.StatusConflict, "name already exists")
		}
		return fiber.NewError(fiber.StatusInternalServerError, "db error")
	}
	return c.SendStatus(fiber.StatusCreated)
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
		out = append(out, dirOut{
			ID:   d.ID.Hex(), // ✅ niente type assertion
			Name: d.Name,
		})
	}
	return c.JSON(out)
}
