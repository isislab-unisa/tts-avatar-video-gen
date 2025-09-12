// backend/handlers/projects.go
package handlers

import (
	"io"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"github.com/Antonio-Caiazzo/DUBME/backend/db"
	"github.com/Antonio-Caiazzo/DUBME/backend/models"
	"github.com/Antonio-Caiazzo/DUBME/backend/storage"
)

type ProjectsHandler struct {
	Store *storage.MinioStore
}

func (h *ProjectsHandler) CreateProject(c *fiber.Ctx) error {
	userID, _ := c.Locals("userId").(string)
	title := strings.TrimSpace(c.FormValue("title"))
	text := strings.TrimSpace(c.FormValue("text"))
	avatar := strings.TrimSpace(c.FormValue("avatar"))
	avatarImage := strings.TrimSpace(c.FormValue("avatarImage"))
	directoryId := strings.TrimSpace(c.FormValue("directoryId"))

	if len(title) < 2 || len(title) > 120 {
		return fiber.NewError(fiber.StatusBadRequest, "titolo non valido")
	}
	if directoryId == "" {
		return fiber.NewError(fiber.StatusBadRequest, "directoryId mancante")
	}

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
	oid := res.InsertedID.(primitive.ObjectID)
	return c.Status(fiber.StatusCreated).JSON(bson.M{"id": oid.Hex()})
}

type projectOut struct {
	ID          string    `json:"id"`
	Title       string    `json:"title"`
	Text        string    `json:"text"`
	DirectoryID string    `json:"directoryId"`
	CreatedAt   time.Time `json:"createdAt"`
	Avatar      string    `json:"avatar"`
	AvatarImage string    `json:"avatarImage"`
	BucketID    string    `json:"bucketId"`
	DownloadURL string    `json:"downloadUrl"`
}

func (h *ProjectsHandler) GetProject(c *fiber.Ctx) error {
	userID, _ := c.Locals("userId").(string)
	id := c.Params("id")
	oid, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "bad id")
	}
	var doc models.Project
	err = db.Col("projects").FindOne(c.Context(), bson.M{"_id": oid, "userId": userID}).Decode(&doc)
	if err != nil {
		return fiber.NewError(fiber.StatusNotFound, "not found")
	}
	url, err := h.Store.PresignGet(c.Context(), doc.BucketID, 10*time.Minute)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "presign error")
	}
	return c.JSON(projectOut{
		ID:          doc.ID.Hex(),
		Title:       doc.Title,
		Text:        doc.Text,
		DirectoryID: doc.DirectoryID,
		CreatedAt:   doc.CreatedAt,
		Avatar:      doc.Avatar,
		AvatarImage: doc.AvatarImage,
		BucketID:    doc.BucketID,
		DownloadURL: url,
	})
}

type projUpdateBody struct {
	Title       *string `json:"title,omitempty"`
	DirectoryID *string `json:"directoryId,omitempty"`
}

func (h *ProjectsHandler) UpdateProject(c *fiber.Ctx) error {
	userID, _ := c.Locals("userId").(string)
	id := c.Params("id")
	oid, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "bad id")
	}
	var body projUpdateBody
	if err := c.BodyParser(&body); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid body")
	}
	update := bson.M{}
	if body.Title != nil {
		t := strings.TrimSpace(*body.Title)
		if len(t) < 2 || len(t) > 120 {
			return fiber.NewError(fiber.StatusBadRequest, "titolo non valido")
		}
		update["title"] = t
	}
	if body.DirectoryID != nil {
		update["directoryId"] = strings.TrimSpace(*body.DirectoryID)
	}
	if len(update) == 0 {
		return c.SendStatus(fiber.StatusNoContent)
	}
	_, err = db.Col("projects").UpdateOne(c.Context(),
		bson.M{"_id": oid, "userId": userID},
		bson.M{"$set": update},
	)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "db error")
	}
	return c.SendStatus(fiber.StatusNoContent)
}

func (h *ProjectsHandler) DeleteProject(c *fiber.Ctx) error {
	userID, _ := c.Locals("userId").(string)
	id := c.Params("id")
	oid, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "bad id")
	}
	var doc models.Project
	err = db.Col("projects").FindOne(c.Context(), bson.M{"_id": oid, "userId": userID}).Decode(&doc)
	if err != nil {
		return fiber.NewError(fiber.StatusNotFound, "not found")
	}
	_ = h.Store.Remove(c.Context(), doc.BucketID)
	_, _ = db.Col("projects").DeleteOne(c.Context(), bson.M{"_id": oid, "userId": userID})
	return c.SendStatus(fiber.StatusNoContent)
}

// GET /api/projects?dir=<id>&sort=createdAt|title&order=asc|desc&limit=12&skip=0
func (h *ProjectsHandler) ListProjects(c *fiber.Ctx) error {
	userID, _ := c.Locals("userId").(string)
	dir := strings.TrimSpace(c.Query("dir"))
	sort := c.Query("sort", "createdAt")
	order := c.Query("order", "desc")
	limit := int64(c.QueryInt("limit", 12))
	skip := int64(c.QueryInt("skip", 0))

	if dir == "" {
		return fiber.NewError(fiber.StatusBadRequest, "dir obbligatoria")
	}

	sortKey := "createdAt"
	if sort == "title" {
		sortKey = "title"
	}
	sortDir := -1
	if strings.ToLower(order) == "asc" {
		sortDir = 1
	}

	filter := bson.M{"userId": userID, "directoryId": dir}
	opts := options.Find().
		SetSort(bson.D{{Key: sortKey, Value: sortDir}}).
		SetLimit(limit).
		SetSkip(skip)

	cur, err := db.Col("projects").Find(c.Context(), filter, opts)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "db error")
	}
	defer cur.Close(c.Context())

	type item struct {
		ID          string    `json:"id"`
		Title       string    `json:"title"`
		CreatedAt   time.Time `json:"createdAt"`
		AvatarImage string    `json:"avatarImage"`
	}

	var out []item
	for cur.Next(c.Context()) {
		var p models.Project
		if err := cur.Decode(&p); err == nil {
			out = append(out, item{
				ID:          p.ID.Hex(),
				Title:       p.Title,
				CreatedAt:   p.CreatedAt,
				AvatarImage: p.AvatarImage,
			})
		}
	}
	total, _ := db.Col("projects").CountDocuments(c.Context(), filter)
	return c.JSON(bson.M{"items": out, "total": total})
}

// GET /api/projects/all  (paginato, ordinabile)
func (h *ProjectsHandler) ListAllProjects(c *fiber.Ctx) error {
	userID, _ := c.Locals("userId").(string)

	sort := c.Query("sort", "createdAt")
	order := c.Query("order", "desc")
	limit := int64(c.QueryInt("limit", 12))
	skip := int64(c.QueryInt("skip", 0))

	sortKey := "createdAt"
	if sort == "title" {
		sortKey = "title"
	}
	sortDir := -1
	if strings.ToLower(order) == "asc" {
		sortDir = 1
	}

	filter := bson.M{"userId": userID}
	opts := options.Find().
		SetSort(bson.D{{Key: sortKey, Value: sortDir}}).
		SetLimit(limit).
		SetSkip(skip)

	cur, err := db.Col("projects").Find(c.Context(), filter, opts)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "db error")
	}
	defer cur.Close(c.Context())

	type item struct {
		ID          string    `json:"id"`
		Title       string    `json:"title"`
		CreatedAt   time.Time `json:"createdAt"`
		Avatar      string    `json:"avatar"`
		AvatarImage string    `json:"avatarImage"`
		DirectoryID string    `json:"directoryId"`
	}

	var out []item
	for cur.Next(c.Context()) {
		var p models.Project
		if err := cur.Decode(&p); err == nil {
			out = append(out, item{
				ID:          p.ID.Hex(),
				Title:       p.Title,
				CreatedAt:   p.CreatedAt,
				Avatar:      p.Avatar,
				AvatarImage: p.AvatarImage,
				DirectoryID: p.DirectoryID,
			})
		}
	}
	total, _ := db.Col("projects").CountDocuments(c.Context(), filter)
	return c.JSON(bson.M{"items": out, "total": total})
}

func (h *ProjectsHandler) DownloadProject(c *fiber.Ctx) error {
	userID, _ := c.Locals("userId").(string)
	if userID == "" {
		return fiber.NewError(fiber.StatusUnauthorized, "unauthorized")
	}
	id := c.Params("id")
	oid, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid id")
	}

	// owner check
	var doc models.Project
	if err := db.Col("projects").FindOne(c.Context(), bson.M{"_id": oid, "userId": userID}).Decode(&doc); err != nil {
		if err == mongo.ErrNoDocuments {
			return fiber.NewError(fiber.StatusNotFound, "not found")
		}
		return fiber.NewError(fiber.StatusInternalServerError, "db error")
	}

	// presigned 10 minuti
	url, err := h.Store.PresignGet(c.Context(), doc.BucketID, 10*time.Minute)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "presign error")
	}

	return c.Redirect(url, fiber.StatusFound) // 302
}
