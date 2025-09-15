package handlers

import (
	"os"
	"time"

	"github.com/gofiber/fiber/v2"
)

type GeneratorHandler struct {
	TestVideoPath string // es: "assets/test.mp4"
}

// POST /api/generate  -> ritorna sempre test.mp4 dopo un piccolo delay che poi in futuro sarà sostituito con il vero generatore
func (h *GeneratorHandler) Generate(c *fiber.Ctx) error {
	// Simula lavoro
	time.Sleep(2 * time.Second)

	bin, err := os.ReadFile(h.TestVideoPath)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "missing test video")
	}
	c.Set("Content-Type", "video/mp4")
	return c.Send(bin)
}
