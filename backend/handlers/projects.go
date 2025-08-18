package handlers

import (
	"io"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/Antonio-Caiazzo/DUBME/backend/db"
	"github.com/Antonio-Caiazzo/DUBME/backend/models"
	"github.com/Antonio-Caiazzo/DUBME/backend/storage"
)

type ProjectsHandler struct {
	Store *storage.MinioStore
}

func (h *ProjectsHandler) CreateProject(c *fiber.Ctx) error {
	userID, _ := c.Locals("userId").(string)
	if strings.TrimSpace(userID) == "" {
		return fiber.NewError(fiber.StatusUnauthorized, "missing user")
	}

	title := strings.TrimSpace(c.FormValue("title"))
	text := strings.TrimSpace(c.FormValue("text"))
	avatar := strings.TrimSpace(c.FormValue("avatar"))
	avatarImage := strings.TrimSpace(c.FormValue("avatarImage"))
	directoryId := strings.TrimSpace(c.FormValue("directoryId"))

	file, err := c.FormFile("video")
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "video mancante")
	}
	ff, err := file.Open()
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "video illeggibile")
	}
	defer ff.Close()

	bin, err := io.ReadAll(ff)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "video illeggibile")
	}

	// upload su MinIO
	objName, err := h.Store.PutMP4(c.Context(), bin)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "upload fallito")
	}

	doc := models.Project{
		UserID:      userID,
		Title:       title,
		DirectoryID: directoryId,
		CreatedAt:   time.Now(),
		Avatar:      avatar,
		AvatarImage: avatarImage,
		Text:        text,
		BucketID:    objName,
	}

	res, err := db.Col("projects").InsertOne(c.Context(), doc)
	if err != nil {
		if mongo.IsDuplicateKeyError(err) {
			return fiber.NewError(fiber.StatusConflict, "duplicato")
		}
		return fiber.NewError(fiber.StatusInternalServerError, "db error")
	}

	oid, _ := res.InsertedID.(primitive.ObjectID)
	return c.Status(fiber.StatusCreated).JSON(bson.M{"id": oid.Hex()})
}
