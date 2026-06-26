package application

import "backend/internal/chat/domain"

type MessageRequest struct {
	BotSlug     string             `json:"bot_slug"`
	SessionID   string             `json:"session_id"`
	LandingURL  string             `json:"landing_url"`
	Message     string             `json:"message"`
	Attribution domain.Attribution `json:"attribution"`
}

type MessageResponse struct {
	OK             bool                `json:"ok"`
	BotSlug        string              `json:"bot_slug"`
	SessionID      string              `json:"session_id"`
	ConversationID string              `json:"conversation_id"`
	Stage          domain.Stage        `json:"stage"`
	Score          int                 `json:"score"`
	Lead           LeadSnapshot        `json:"lead"`
	Handoff        HandoffSnapshot     `json:"handoff"`
	Response       BotResponseSnapshot `json:"response"`
	Knowledge      KnowledgeSnapshot   `json:"knowledge"`
}

type LeadSnapshot struct {
	ID                   string       `json:"id,omitempty"`
	Name                 string       `json:"name,omitempty"`
	Email                string       `json:"email,omitempty"`
	Phone                string       `json:"phone,omitempty"`
	Interest             string       `json:"interest,omitempty"`
	Travelers            string       `json:"travelers,omitempty"`
	PreferredContactTime string       `json:"preferred_contact_time,omitempty"`
	TravelDate           string       `json:"travel_date,omitempty"`
	Priority             string       `json:"priority,omitempty"`
	SpecialOccasion      string       `json:"special_occasion,omitempty"`
	Stage                domain.Stage `json:"stage"`
	Score                int          `json:"score"`
	HandoffRequired      bool         `json:"handoff_required"`
	HandoffReason        string       `json:"handoff_reason,omitempty"`
}

type HandoffSnapshot struct {
	Required bool   `json:"required"`
	Reason   string `json:"reason,omitempty"`
}

type BotResponseSnapshot struct {
	Text   string `json:"text"`
	Source string `json:"source"`
}

type KnowledgeSnapshot struct {
	Slug        string `json:"slug"`
	BrandName   string `json:"brand_name"`
	DisplayName string `json:"display_name"`
}
