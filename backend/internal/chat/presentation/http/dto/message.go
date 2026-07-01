package dto

import "backend/internal/chat/domain"

type MessageRequest struct {
	BotSlug     string             `json:"bot_slug"`
	SessionID   string             `json:"session_id"`
	LandingURL  string             `json:"landing_url"`
	Message     string             `json:"message"`
	Name        string             `json:"name,omitempty"`
	Email       string             `json:"email,omitempty"`
	Phone       string             `json:"phone,omitempty"`
	Attribution domain.Attribution `json:"attribution"`
}
