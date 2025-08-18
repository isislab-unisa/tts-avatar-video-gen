package main

import (
	"context"
	"fmt"
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

// JWT middleware: Authorization: Bearer <token>
func jwtAuth() fiber.Handler {
	secret := []byte(os.Getenv("API_JWT_SECRET"))
	return func(c *fiber.Ctx) error {
		auth := c.Get("Authorization")
		if !strings.HasPrefix(auth, "Bearer ") {
			return fiber.NewError(fiber.StatusUnauthorized, "missing token")
		}
		tokenStr := strings.TrimPrefix(auth, "Bearer ")
		claims := &jwt.RegisteredClaims{}

		token, err := jwt.ParseWithClaims(tokenStr, claims, func(t *jwt.Token) (interface{}, error) {
			if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("bad alg")
			}
			return secret, nil
		})
		if err != nil || !token.Valid {
			return fiber.NewError(fiber.StatusUnauthorized, "invalid token")
		}

		// Verifica issuer + audience (compatibile con tutte le versioni)
		if claims.Issuer != "dubme-web" {
			return fiber.NewError(fiber.StatusUnauthorized, "bad claims")
		}
		audOK := false
		for _, a := range claims.Audience {
			if a == "dubme-api" {
				audOK = true
				break
			}
		}
		if !audOK {
			return fiber.NewError(fiber.StatusUnauthorized, "bad claims")
		}

		// user id nel contesto
		c.Locals("userId", claims.Subject)
		return c.Next()
	}
}

func main() {
	_ = godotenv.Load(".env") // carica backend/.env se presente

	// Mongo
	if err := db.Connect(); err != nil {
		log.Fatal(err)
	}
	if err := handlers.EnsureDirectoryIndexes(context.Background()); err != nil {
		log.Fatal("ensure indexes:", err)
	}

	// MinIO (crea il bucket se non esiste)
	minioStore, err := storage.NewMinio(context.Background())
	if err != nil {
		log.Fatal("minio:", err)
	}

	// Handlers con dipendenze
	proj := &handlers.ProjectsHandler{Store: minioStore}
	gen := &handlers.GeneratorHandler{TestVideoPath: "assets/test.mp4"}

	app := fiber.New()
	app.Use(cors.New(cors.Config{
		AllowOrigins:     strings.TrimSpace(os.Getenv("CORS_ORIGINS")), // es: http://localhost:3000
		AllowHeaders:     "Content-Type,Authorization",
		AllowMethods:     "GET,POST,OPTIONS",
		AllowCredentials: true,
	}))

	// API protette da JWT
	api := app.Group("/api", jwtAuth())

	// Directories
	api.Post("/directories", handlers.CreateDirectory)
	api.Get("/directories", handlers.ListDirectories)

	// Progetti + generatore
	api.Post("/projects", proj.CreateProject)
	api.Post("/generate", gen.Generate)

	port := os.Getenv("PORT")
	if port == "" {
		port = "4000"
	}
	log.Println("fiber listening on :" + port)
	log.Fatal(app.Listen(":" + port))
}
