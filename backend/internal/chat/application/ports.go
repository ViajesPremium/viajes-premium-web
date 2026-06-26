package application

import (
	"context"
	"time"

	"backend/internal/chat/domain"
)

type KnowledgeStore interface {
	Get(ctx context.Context, slug string) (domain.BotKnowledge, error)
	List(ctx context.Context) ([]domain.BotKnowledge, error)
}

type ConversationRepository interface {
	FindByID(ctx context.Context, conversationID string) (*domain.Conversation, error)
	FindBySession(ctx context.Context, botSlug, sessionID string) (*domain.Conversation, error)
	Create(ctx context.Context, conversation *domain.Conversation) error
	Update(ctx context.Context, conversation *domain.Conversation) error
}

type MessageRepository interface {
	Insert(ctx context.Context, message *domain.Message) error
	ListByConversation(ctx context.Context, conversationID string) ([]domain.Message, error)
	ListRecentByConversation(ctx context.Context, conversationID string, limit int) ([]domain.Message, error)
}

type LeadRepository interface {
	FindByConversation(ctx context.Context, conversationID string) (*domain.Lead, error)
	ListPendingBotEmails(ctx context.Context, before time.Time, limit int) ([]*domain.Lead, error)
	Create(ctx context.Context, lead *domain.Lead) error
	Update(ctx context.Context, lead *domain.Lead) error
}

type LeadEventRepository interface {
	Insert(ctx context.Context, event *domain.LeadEvent) error
}

type LLMClient interface {
	Enabled() bool
	Generate(ctx context.Context, req PromptRequest) (LLMResponse, error)
}

type Clock interface {
	Now() time.Time
}

type PromptRequest struct {
	SystemPrompt string
	Messages     []PromptMessage
	MaxTokens    int
	Temperature  float64
}

type PromptMessage struct {
	Role    domain.Role
	Content string
}

type LLMResponse struct {
	Text   string
	Source string
}