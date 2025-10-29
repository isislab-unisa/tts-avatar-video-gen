// package handlers

// import (
// 	"os"
// 	"time"

// 	"github.com/gofiber/fiber/v2"
// )

// type GeneratorHandler struct {
// 	TestVideoPath string // es: "assets/test.mp4"
// }

// // POST /api/generate  -> ritorna sempre test.mp4 dopo un piccolo delay che poi in futuro sarà sostituito con il vero generatore
// func (h *GeneratorHandler) Generate(c *fiber.Ctx) error {
// 	// Simula lavoro
// 	time.Sleep(2 * time.Second)

// 	bin, err := os.ReadFile(h.TestVideoPath)
// 	if err != nil {
// 		return fiber.NewError(fiber.StatusInternalServerError, "missing test video")
// 	}
// 	c.Set("Content-Type", "video/mp4")
// 	return c.Send(bin)
// }

// backend/handlers/generator.go
package handlers

import (
	"bytes"
	"context"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
)

type GeneratorHandler struct {
	TestVideoPath string // es: "assets/test.mp4"
}

type genReq struct {
	Text    string `json:"text"`
	Avatar  string `json:"avatar,omitempty"`
	BgColor string `json:"bgColor,omitempty"`
	Title   string `json:"title,omitempty"`
}

func (h *GeneratorHandler) Generate(c *fiber.Ctx) error {
	var in genReq
	if err := c.BodyParser(&in); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid body")
	}
	in.Text = strings.TrimSpace(in.Text)
	if in.Text == "" {
		return fiber.NewError(fiber.StatusBadRequest, "text required")
	}

	domain := strings.TrimSpace(os.Getenv("GENERATOR_URL"))
	if domain == "" {
		domain = "http://host.docker.internal:7001"
	}

	voiceGender := strings.ToLower(strings.TrimSpace(in.Avatar))
	if voiceGender != "female" {
		voiceGender = "male"
	}

	body, _ := json.Marshal(map[string]any{
		"text":          in.Text,
		"voice_gender":  voiceGender,
		"voice_options": 1,
		"language":      "it",
		"title":         strings.TrimSpace(in.Title),
	})

	ctx, cancel := context.WithTimeout(c.Context(), 4*time.Minute)
	defer cancel()

	req, _ := http.NewRequestWithContext(ctx, "POST", domain+"/generate", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil || resp.StatusCode != http.StatusOK {
		if err != nil {
			log.Printf("generator call error: %v", err)
		}
		if resp != nil && resp.Body != nil {
			b, _ := io.ReadAll(resp.Body)
			resp.Body.Close()
			log.Printf("generator bad response: %s", string(b))
		}

		// Fallback al video di test
		if h.TestVideoPath != "" {
			bin, ferr := os.ReadFile(h.TestVideoPath)
			if ferr == nil {
				c.Set("Content-Type", "video/mp4")
				return c.Send(bin)
			}
		}
		return fiber.NewError(fiber.StatusInternalServerError, "generator unavailable")
	}
	defer resp.Body.Close()

	if out := strings.TrimSpace(resp.Header.Get("X-Generator-Output")); out != "" {
		c.Set("X-Generator-Output", out)
	}
	// Read full body to avoid client-side fetch failures due to streaming/chunked issues
	data, err := io.ReadAll(resp.Body)
	if err != nil {
		return fiber.NewError(fiber.StatusBadGateway, "generator read error")
	}
	c.Set("Content-Type", "video/mp4")
	return c.Send(data)
}

// POST /api/generate/cleanup { path: string }
func (h *GeneratorHandler) Cleanup(c *fiber.Ctx) error {
	var body struct {
		Path string `json:"path"`
	}
	if err := c.BodyParser(&body); err != nil || strings.TrimSpace(body.Path) == "" {
		return c.SendStatus(fiber.StatusNoContent)
	}

	domain := strings.TrimSpace(os.Getenv("GENERATOR_URL"))
	if domain == "" {
		domain = "http://host.docker.internal:7001"
	}

	payload, _ := json.Marshal(map[string]string{"path": body.Path})
	ctx, cancel := context.WithTimeout(c.Context(), 5*time.Second)
	defer cancel()
	req, _ := http.NewRequestWithContext(ctx, http.MethodPost, domain+"/cleanup", bytes.NewReader(payload))
	req.Header.Set("Content-Type", "application/json")
	r, err := http.DefaultClient.Do(req)
	if err == nil && r != nil && r.Body != nil {
		io.Copy(io.Discard, r.Body)
		r.Body.Close()
	}
	return c.SendStatus(fiber.StatusNoContent)
}
