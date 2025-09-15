// backend/main.go
package main

import (
	"context"
	"log"
	"os"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/golang-jwt/jwt/v5"
	"github.com/joho/godotenv"

	"github.com/Antonio-Caiazzo/DUBME/backend/db"
	"github.com/Antonio-Caiazzo/DUBME/backend/handlers"
	"github.com/Antonio-Caiazzo/DUBME/backend/storage"
)

func jwtAuth() fiber.Handler {
	secret := []byte(os.Getenv("API_JWT_SECRET"))
	return func(c *fiber.Ctx) error {
		authHdr := c.Get("Authorization")
		if !strings.HasPrefix(authHdr, "Bearer ") {
			return fiber.NewError(fiber.StatusUnauthorized, "missing token")
		}
		tokenStr := strings.TrimPrefix(authHdr, "Bearer ")
		claims := &jwt.RegisteredClaims{}
		token, err := jwt.ParseWithClaims(tokenStr, claims, func(t *jwt.Token) (interface{}, error) {
			return secret, nil
		})
		if err != nil || !token.Valid || claims.Issuer != "dubme-web" {
			return fiber.NewError(fiber.StatusUnauthorized, "invalid token")
		}
		okAud := false
		for _, a := range claims.Audience {
			if a == "dubme-api" {
				okAud = true
				break
			}
		}
		if !okAud {
			return fiber.NewError(fiber.StatusUnauthorized, "bad claims")
		}
		c.Locals("userId", claims.Subject)
		return c.Next()
	}
}

func main() {
	_ = godotenv.Load(".env")

	if err := db.Connect(); err != nil {
		log.Fatal(err)
	}
	if err := handlers.EnsureDirectoryIndexes(context.Background()); err != nil {
		log.Fatal("ensure indexes:", err)
	}

	minioStore, err := storage.NewMinio(context.Background())
	if err != nil {
		log.Fatal("minio:", err)
	}
	dir := &handlers.DirectoriesHandler{Store: minioStore}
	proj := &handlers.ProjectsHandler{Store: minioStore}
	gen := &handlers.GeneratorHandler{TestVideoPath: strings.TrimSpace(os.Getenv("GENERATOR_TEST_MP4"))}
	if gen.TestVideoPath == "" {
		gen.TestVideoPath = "assets/test.mp4"
	}

	app := fiber.New(fiber.Config{
		BodyLimit: 200 * 1024 * 1024,
	})

	corsOrigins := strings.TrimSpace(os.Getenv("CORS_ORIGINS"))
	if corsOrigins == "" {
		corsOrigins = "http://localhost:3000"
	}

	app.Use(cors.New(cors.Config{
		AllowOrigins:     corsOrigins,
		AllowHeaders:     "Content-Type,Authorization",
		AllowMethods:     "GET,POST,PATCH,DELETE,OPTIONS",
		AllowCredentials: true,
	}))

	// TUTTE le API JWT-protette
	api := app.Group("/api", jwtAuth())

	// Directories
	api.Post("/directories", handlers.CreateDirectory)
	api.Get("/directories", handlers.ListDirectories)
	api.Patch("/directories/:id", handlers.UpdateDirectory)
	api.Delete("/directories/:id", dir.DeleteDirectory)

	// Projects
	api.Post("/projects", proj.CreateProject)
	api.Get("/projects", proj.ListProjects) // by dir
	api.Get("/projects/all", proj.ListAllProjects)
	api.Get("/projects/:id", proj.GetProject)
	api.Get("/projects/:id/video", proj.GetProjectVideo)
	api.Get("/projects/:id/download", proj.DownloadProject)
	api.Patch("/projects/:id", proj.UpdateProject)
	api.Delete("/projects/:id", proj.DeleteProject)

	// Generatore video
	api.Post("/generate", gen.Generate)

	port := os.Getenv("PORT")
	if port == "" {
		port = "4000"
	}
	log.Println("fiber listening on :" + port)
	log.Fatal(app.Listen(":" + port))
}
