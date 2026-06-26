package postgres

import (
	"context"
	"encoding/json"
	"errors"
	"strings"
	"time"

	"backend/internal/leads/domain"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
)

type LeadStore struct {
	pool *pgxpool.Pool
}

func NewLeadStore(pool *pgxpool.Pool) *LeadStore {
	return &LeadStore{pool: pool}
}

func (r *LeadStore) SaveLead(ctx context.Context, lead *domain.Lead) error {
	if lead == nil {
		return errors.New("lead is nil")
	}

	now := lead.UpdatedAt.UTC()
	if now.IsZero() {
		now = time.Now().UTC()
	}
	if strings.TrimSpace(lead.ID) == "" {
		lead.ID = newFormLeadID()
	}
	if strings.TrimSpace(lead.ConversationID) == "" {
		lead.ConversationID = lead.ID
	}
	if strings.TrimSpace(lead.BotSlug) == "" {
		lead.BotSlug = landingSlugFromPath(lead.PagePath)
	}
	if strings.TrimSpace(lead.LandingSlug) == "" {
		lead.LandingSlug = landingSlugFromPath(firstNonEmpty(lead.Attribution.LandingSlug, lead.PagePath))
	}
	if strings.TrimSpace(lead.Stage) == "" {
		lead.Stage = "new"
	}
	if strings.TrimSpace(lead.Priority) == "" {
		lead.Priority = "normal"
	}

	tx, err := r.pool.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return err
	}
	defer func() {
		_ = tx.Rollback(ctx)
	}()

	metadata := map[string]any{
		"source":          "form",
		"form_id":         lead.FormID,
		"page_path":       lead.PagePath,
		"crm_tag":         lead.CRMTag,
		"travel_wishes":   lead.TravelWishes,
		"experience_type": lead.ExperienceType,
		"attribution": map[string]any{
			"utm_source":   lead.Attribution.UTMSource,
			"utm_medium":   lead.Attribution.UTMMedium,
			"utm_campaign": lead.Attribution.UTMCampaign,
			"utm_content":  lead.Attribution.UTMContent,
			"utm_term":     lead.Attribution.UTMTerm,
			"fbclid":       lead.Attribution.FBCLID,
			"referrer":     lead.Attribution.Referrer,
			"landing_slug": lead.Attribution.LandingSlug,
			"destination":  lead.Attribution.Destination,
			"page_path":    lead.Attribution.PagePath,
		},
	}
	metadataJSON, err := json.Marshal(metadata)
	if err != nil {
		return err
	}

	landingURL := firstNonEmpty(lead.Attribution.PagePath, lead.PagePath)
	if _, err := tx.Exec(ctx, `
		INSERT INTO conversations (id, bot_slug, session_id, landing_url, landing_slug, stage, score, lead_id, summary, metadata, last_message_at, created_at, updated_at)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
	`, lead.ConversationID, lead.BotSlug, lead.ConversationID, landingURL, lead.LandingSlug, lead.Stage, lead.Score, nil, "form lead", metadataJSON, now, now, now); err != nil {
		return err
	}

	if _, err := tx.Exec(ctx, `
		INSERT INTO leads (
			id, conversation_id, bot_slug, landing_slug, name, email, phone, interest, travelers, preferred_contact_time,
			travel_date, priority, special_occasion, score, stage, handoff_required, handoff_reason,
			bot_email_due_at, bot_email_sent_at, bot_email_message_id, created_at, updated_at
		)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22)
	`, lead.ID, lead.ConversationID, lead.BotSlug, lead.LandingSlug, lead.Name, lead.Email, lead.Phone, firstNonEmpty(lead.Interest, lead.TravelWishes, lead.ExperienceType), lead.Travelers, lead.PreferredContactTime, lead.TravelDate, lead.Priority, lead.SpecialOccasion, lead.Score, lead.Stage, lead.HandoffRequired, lead.HandoffReason, timestamptzOrNil(lead.BotEmailDueAt), timestamptzOrNil(lead.BotEmailSentAt), lead.BotEmailMessageID, now, now); err != nil {
		return err
	}

	if _, err := tx.Exec(ctx, `
		UPDATE conversations
		SET lead_id = $2, updated_at = $3
		WHERE id = $1
	`, lead.ConversationID, lead.ID, now); err != nil {
		return err
	}

	if err := tx.Commit(ctx); err != nil {
		return err
	}

	return nil
}

func landingSlugFromPath(pagePath string) string {
	cleaned := strings.TrimLeft(strings.TrimSpace(pagePath), "/")
	if cleaned == "" {
		return "viajes-premium"
	}
	parts := strings.Split(cleaned, "/")
	if len(parts) == 0 || strings.TrimSpace(parts[0]) == "" {
		return "viajes-premium"
	}
	return parts[0]
}

func firstNonEmpty(values ...string) string {
	for _, value := range values {
		if strings.TrimSpace(value) != "" {
			return strings.TrimSpace(value)
		}
	}
	return ""
}

func newFormLeadID() string {
	return "lead-" + strings.ReplaceAll(time.Now().UTC().Format(time.RFC3339Nano), ":", "")
}

func timestamptzOrNil(value time.Time) any {
	if value.IsZero() {
		return nil
	}
	return pgtype.Timestamptz{Time: value.UTC(), Valid: true}
}
