package dto

import "backend/internal/chat/domain"

type MessageRequest struct {
	BotSlug     string             `json:"bot_slug"`
	SessionID   string             `json:"session_id"`
	LandingURL  string             `json:"landing_url"`
	Message     string             `json:"message"`
	Attribution domain.Attribution `json:"attribution"`
}
