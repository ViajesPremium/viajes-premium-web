package postgres

import (
	"context"
	"encoding/json"
	"errors"
	"strings"
	"time"

	"backend/internal/chat/domain"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
)

var ErrNotFound = errors.New("not found")

type ConversationRepository struct {
	pool *pgxpool.Pool
}

type MessageRepository struct {
	pool *pgxpool.Pool
}

type LeadRepository struct {
	pool *pgxpool.Pool
}

type LeadEventRepository struct {
	pool *pgxpool.Pool
}

func NewConversationRepository(pool *pgxpool.Pool) *ConversationRepository {
	return &ConversationRepository{pool: pool}
}
func NewMessageRepository(pool *pgxpool.Pool) *MessageRepository {
	return &MessageRepository{pool: pool}
}
func NewLeadRepository(pool *pgxpool.Pool) *LeadRepository { return &LeadRepository{pool: pool} }
func NewLeadEventRepository(pool *pgxpool.Pool) *LeadEventRepository {
	return &LeadEventRepository{pool: pool}
}

func (r *ConversationRepository) FindByID(ctx context.Context, conversationID string) (*domain.Conversation, error) {
	row := r.pool.QueryRow(ctx, `
		SELECT id, bot_slug, session_id, landing_url, landing_slug, stage, score, lead_id, summary, metadata, last_message_at, created_at, updated_at
		FROM conversations
		WHERE id = $1
	`, conversationID)

	return scanConversation(row)
}

func (r *ConversationRepository) FindBySession(ctx context.Context, botSlug, sessionID string) (*domain.Conversation, error) {
	row := r.pool.QueryRow(ctx, `
		SELECT id, bot_slug, session_id, landing_url, landing_slug, stage, score, lead_id, summary, metadata, last_message_at, created_at, updated_at
		FROM conversations
		WHERE bot_slug = $1 AND session_id = $2
	`, botSlug, sessionID)

	return scanConversation(row)
}

func (r *ConversationRepository) Create(ctx context.Context, conversation *domain.Conversation) error {
	metadata, err := json.Marshal(conversation.Metadata)
	if err != nil {
		return err
	}
	_, err = r.pool.Exec(ctx, `
		INSERT INTO conversations (id, bot_slug, session_id, landing_url, landing_slug, stage, score, lead_id, summary, metadata, last_message_at, created_at, updated_at)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
	`, conversation.ID, conversation.BotSlug, conversation.SessionID, conversation.LandingURL, conversation.LandingSlug, conversation.Stage, conversation.Score, nullIfEmpty(conversation.LeadID), conversation.Summary, metadata, conversation.LastMessageAt, conversation.CreatedAt, conversation.UpdatedAt)
	return err
}

func (r *ConversationRepository) Update(ctx context.Context, conversation *domain.Conversation) error {
	metadata, err := json.Marshal(conversation.Metadata)
	if err != nil {
		return err
	}
	_, err = r.pool.Exec(ctx, `
		UPDATE conversations
		SET landing_url = $2, landing_slug = $3, stage = $4, score = $5, lead_id = $6, summary = $7, metadata = $8, last_message_at = $9, updated_at = $10
		WHERE id = $1
	`, conversation.ID, conversation.LandingURL, conversation.LandingSlug, conversation.Stage, conversation.Score, nullIfEmpty(conversation.LeadID), conversation.Summary, metadata, conversation.LastMessageAt, conversation.UpdatedAt)
	return err
}

func (r *MessageRepository) Insert(ctx context.Context, message *domain.Message) error {
	metadata, err := json.Marshal(message.Metadata)
	if err != nil {
		return err
	}
	_, err = r.pool.Exec(ctx, `
		INSERT INTO messages (id, conversation_id, role, content, source, metadata, created_at)
		VALUES ($1,$2,$3,$4,$5,$6,$7)
	`, message.ID, message.ConversationID, message.Role, message.Content, message.Source, metadata, message.CreatedAt)
	return err
}

func (r *MessageRepository) ListByConversation(ctx context.Context, conversationID string) ([]domain.Message, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT id, conversation_id, role, content, source, metadata, created_at
		FROM messages
		WHERE conversation_id = $1
		ORDER BY created_at ASC
	`, conversationID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := make([]domain.Message, 0)
	for rows.Next() {
		message, err := scanMessage(rows)
		if err != nil {
			return nil, err
		}
		items = append(items, *message)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	return items, nil
}

func (r *MessageRepository) ListRecentByConversation(ctx context.Context, conversationID string, limit int) ([]domain.Message, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT id, conversation_id, role, content, source, metadata, created_at
		FROM messages
		WHERE conversation_id = $1
		ORDER BY created_at DESC
		LIMIT $2
	`, conversationID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := make([]domain.Message, 0)
	for rows.Next() {
		message, err := scanMessage(rows)
		if err != nil {
			return nil, err
		}
		items = append(items, *message)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	// Preserve chronological order for the prompt.
	for i, j := 0, len(items)-1; i < j; i, j = i+1, j-1 {
		items[i], items[j] = items[j], items[i]
	}
	return items, nil
}

func (r *LeadRepository) FindByConversation(ctx context.Context, conversationID string) (*domain.Lead, error) {
	row := r.pool.QueryRow(ctx, `
		SELECT id, conversation_id, bot_slug, landing_slug, attribution, name, email, phone, interest, travelers, preferred_contact_time, travel_date, priority, special_occasion, score, stage, handoff_required, handoff_reason, bot_email_due_at, bot_email_sent_at, bot_email_message_id, created_at, updated_at
		FROM leads
		WHERE conversation_id = $1
	`, conversationID)

	return scanLead(row)
}

func (r *LeadRepository) ListPendingBotEmails(ctx context.Context, before time.Time, limit int) ([]*domain.Lead, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT id, conversation_id, bot_slug, landing_slug, attribution, name, email, phone, interest, travelers, preferred_contact_time, travel_date, priority, special_occasion, score, stage, handoff_required, handoff_reason, bot_email_due_at, bot_email_sent_at, bot_email_message_id, created_at, updated_at
		FROM leads
		WHERE bot_email_sent_at IS NULL
		  AND bot_email_due_at IS NOT NULL
		  AND bot_email_due_at <= $1
		  AND COALESCE(name, '') <> ''
		  AND COALESCE(phone, '') <> ''
		ORDER BY bot_email_due_at ASC
		LIMIT $2
	`, before, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := make([]*domain.Lead, 0)
	for rows.Next() {
		lead, err := scanLead(rows)
		if err != nil {
			return nil, err
		}
		items = append(items, lead)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	return items, nil
}

func (r *LeadRepository) Create(ctx context.Context, lead *domain.Lead) error {
	_, err := r.pool.Exec(ctx, `
		INSERT INTO leads (id, conversation_id, bot_slug, landing_slug, attribution, name, email, phone, interest, travelers, preferred_contact_time, travel_date, priority, special_occasion, score, stage, handoff_required, handoff_reason, bot_email_due_at, bot_email_sent_at, bot_email_message_id, created_at, updated_at)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23)
	`, lead.ID, lead.ConversationID, lead.BotSlug, lead.LandingSlug, attributionJSON(lead.Attribution), lead.Name, lead.Email, lead.Phone, lead.Interest, lead.Travelers, lead.PreferredContactTime, lead.TravelDate, lead.Priority, lead.SpecialOccasion, lead.Score, lead.Stage, lead.HandoffRequired, lead.HandoffReason, timestamptzOrNil(lead.BotEmailDueAt), timestamptzOrNil(lead.BotEmailSentAt), lead.BotEmailMessageID, lead.CreatedAt, lead.UpdatedAt)
	return err
}

func (r *LeadRepository) Update(ctx context.Context, lead *domain.Lead) error {
	lead.UpdatedAt = time.Now().UTC()
	_, err := r.pool.Exec(ctx, `
		UPDATE leads
		SET landing_slug = $2, attribution = $3, name = $4, email = $5, phone = $6, interest = $7, travelers = $8, preferred_contact_time = $9, travel_date = $10, priority = $11, special_occasion = $12, score = $13, stage = $14, handoff_required = $15, handoff_reason = $16, bot_email_due_at = $17, bot_email_sent_at = $18, bot_email_message_id = $19, updated_at = $20
		WHERE id = $1
	`, lead.ID, lead.LandingSlug, attributionJSON(lead.Attribution), lead.Name, lead.Email, lead.Phone, lead.Interest, lead.Travelers, lead.PreferredContactTime, lead.TravelDate, lead.Priority, lead.SpecialOccasion, lead.Score, lead.Stage, lead.HandoffRequired, lead.HandoffReason, timestamptzOrNil(lead.BotEmailDueAt), timestamptzOrNil(lead.BotEmailSentAt), lead.BotEmailMessageID, lead.UpdatedAt)
	return err
}

func (r *LeadEventRepository) Insert(ctx context.Context, event *domain.LeadEvent) error {
	details, err := json.Marshal(event.Details)
	if err != nil {
		return err
	}
	_, err = r.pool.Exec(ctx, `
		INSERT INTO lead_events (id, lead_id, event_type, details, created_at)
		VALUES ($1,$2,$3,$4,$5)
	`, event.ID, event.LeadID, event.EventType, details, event.CreatedAt)
	return err
}

type rowScanner interface {
	Scan(...any) error
}

func scanConversation(row rowScanner) (*domain.Conversation, error) {
	var conversation domain.Conversation
	var metadata []byte
	if err := row.Scan(
		&conversation.ID,
		&conversation.BotSlug,
		&conversation.SessionID,
		&conversation.LandingURL,
		&conversation.LandingSlug,
		&conversation.Stage,
		&conversation.Score,
		&conversation.LeadID,
		&conversation.Summary,
		&metadata,
		&conversation.LastMessageAt,
		&conversation.CreatedAt,
		&conversation.UpdatedAt,
	); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	if len(metadata) > 0 {
		_ = json.Unmarshal(metadata, &conversation.Metadata)
	}
	return &conversation, nil
}

func scanMessage(row rowScanner) (*domain.Message, error) {
	var message domain.Message
	var metadata []byte
	if err := row.Scan(
		&message.ID,
		&message.ConversationID,
		&message.Role,
		&message.Content,
		&message.Source,
		&metadata,
		&message.CreatedAt,
	); err != nil {
		return nil, err
	}
	if len(metadata) > 0 {
		_ = json.Unmarshal(metadata, &message.Metadata)
	}
	return &message, nil
}

func scanLead(row rowScanner) (*domain.Lead, error) {
	var lead domain.Lead
	var attribution []byte
	var botEmailDueAt pgtype.Timestamptz
	var botEmailSentAt pgtype.Timestamptz
	if err := row.Scan(
		&lead.ID,
		&lead.ConversationID,
		&lead.BotSlug,
		&lead.LandingSlug,
		&attribution,
		&lead.Name,
		&lead.Email,
		&lead.Phone,
		&lead.Interest,
		&lead.Travelers,
		&lead.PreferredContactTime,
		&lead.TravelDate,
		&lead.Priority,
		&lead.SpecialOccasion,
		&lead.Score,
		&lead.Stage,
		&lead.HandoffRequired,
		&lead.HandoffReason,
		&botEmailDueAt,
		&botEmailSentAt,
		&lead.BotEmailMessageID,
		&lead.CreatedAt,
		&lead.UpdatedAt,
	); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	lead.BotEmailDueAt = timestamptzToTime(botEmailDueAt)
	lead.BotEmailSentAt = timestamptzToTime(botEmailSentAt)
	if len(attribution) > 0 {
		_ = json.Unmarshal(attribution, &lead.Attribution)
	}
	return &lead, nil
}

func timestamptzOrNil(value time.Time) any {
	if value.IsZero() {
		return nil
	}
	return pgtype.Timestamptz{Time: value.UTC(), Valid: true}
}

func timestamptzToTime(value pgtype.Timestamptz) time.Time {
	if !value.Valid {
		return time.Time{}
	}
	return value.Time.UTC()
}

func nullIfEmpty(value string) any {
	if strings.TrimSpace(value) == "" {
		return nil
	}
	return value
}

func attributionJSON(value domain.Attribution) any {
	if !hasAttributionJSON(value) {
		return []byte(`{}`)
	}
	data, err := json.Marshal(value)
	if err != nil {
		return []byte(`{}`)
	}
	return data
}

func hasAttributionJSON(value domain.Attribution) bool {
	return strings.TrimSpace(value.UTMSource) != "" ||
		strings.TrimSpace(value.UTMMedium) != "" ||
		strings.TrimSpace(value.UTMCampaign) != "" ||
		strings.TrimSpace(value.UTMContent) != "" ||
		strings.TrimSpace(value.UTMTerm) != "" ||
		strings.TrimSpace(value.FBCLID) != "" ||
		strings.TrimSpace(value.Referrer) != "" ||
		strings.TrimSpace(value.LandingSlug) != "" ||
		strings.TrimSpace(value.Destination) != "" ||
		strings.TrimSpace(value.PagePath) != ""
}
