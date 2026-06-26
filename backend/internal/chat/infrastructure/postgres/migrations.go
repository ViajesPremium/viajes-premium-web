package postgres

import (
	"context"
	"net/url"
	"path"
	"strings"

	"github.com/jackc/pgx/v5/pgxpool"
)

func applySchemaCompatibilityMigrations(ctx context.Context, pool *pgxpool.Pool) error {
	statements := []string{
		`ALTER TABLE conversations ADD COLUMN IF NOT EXISTS landing_slug text NOT NULL DEFAULT '';`,
		`ALTER TABLE conversations ADD COLUMN IF NOT EXISTS score integer NOT NULL DEFAULT 0;`,
		`ALTER TABLE conversations ADD COLUMN IF NOT EXISTS last_message_at timestamptz NOT NULL DEFAULT now();`,
		`ALTER TABLE leads ADD COLUMN IF NOT EXISTS conversation_id text;`,
		`ALTER TABLE leads ADD COLUMN IF NOT EXISTS bot_slug text NOT NULL DEFAULT 'home';`,
		`ALTER TABLE leads ADD COLUMN IF NOT EXISTS landing_slug text NOT NULL DEFAULT '';`,
		`ALTER TABLE leads ADD COLUMN IF NOT EXISTS attribution jsonb NOT NULL DEFAULT '{}'::jsonb;`,
		`ALTER TABLE leads ADD COLUMN IF NOT EXISTS score integer NOT NULL DEFAULT 0;`,
		`ALTER TABLE leads ADD COLUMN IF NOT EXISTS stage text NOT NULL DEFAULT 'new';`,
		`ALTER TABLE leads ADD COLUMN IF NOT EXISTS travelers text NOT NULL DEFAULT '';`,
		`ALTER TABLE leads ADD COLUMN IF NOT EXISTS preferred_contact_time text NOT NULL DEFAULT '';`,
		`ALTER TABLE leads ADD COLUMN IF NOT EXISTS travel_date text NOT NULL DEFAULT '';`,
		`ALTER TABLE leads ADD COLUMN IF NOT EXISTS priority text NOT NULL DEFAULT 'normal';`,
		`ALTER TABLE leads ADD COLUMN IF NOT EXISTS special_occasion text NOT NULL DEFAULT '';`,
		`ALTER TABLE leads ADD COLUMN IF NOT EXISTS handoff_required boolean NOT NULL DEFAULT false;`,
		`ALTER TABLE leads ADD COLUMN IF NOT EXISTS handoff_reason text NOT NULL DEFAULT '';`,
		`ALTER TABLE leads ADD COLUMN IF NOT EXISTS bot_email_due_at timestamptz;`,
		`ALTER TABLE leads ADD COLUMN IF NOT EXISTS bot_email_sent_at timestamptz;`,
		`ALTER TABLE leads ADD COLUMN IF NOT EXISTS bot_email_message_id text NOT NULL DEFAULT '';`,
		`ALTER TABLE messages ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT '';`,
		`ALTER TABLE lead_events ADD COLUMN IF NOT EXISTS details jsonb NOT NULL DEFAULT '{}'::jsonb;`,
		`CREATE UNIQUE INDEX IF NOT EXISTS conversations_bot_slug_session_id_key ON conversations (bot_slug, session_id);`,
		`CREATE UNIQUE INDEX IF NOT EXISTS leads_conversation_id_key ON leads (conversation_id);`,
		`CREATE INDEX IF NOT EXISTS idx_messages_conversation_created_at ON messages(conversation_id, created_at DESC);`,
		`CREATE INDEX IF NOT EXISTS idx_lead_events_lead_created_at ON lead_events(lead_id, created_at DESC);`,
	}

	for _, statement := range statements {
		if _, err := pool.Exec(ctx, statement); err != nil {
			return err
		}
	}

	if hasColumn(ctx, pool, "leads", "session_id") {
		if _, err := pool.Exec(ctx, `ALTER TABLE leads ALTER COLUMN session_id DROP NOT NULL;`); err != nil {
			return err
		}
	}

	if hasColumn(ctx, pool, "conversations", "lead_id") {
		if _, err := pool.Exec(ctx, `ALTER TABLE conversations ALTER COLUMN lead_id DROP NOT NULL;`); err != nil {
			return err
		}
	}

	if hasColumn(ctx, pool, "conversations", "stage") {
		if _, err := pool.Exec(ctx, `ALTER TABLE conversations ALTER COLUMN stage SET DEFAULT 'new';`); err != nil {
			return err
		}
	}

	if hasColumn(ctx, pool, "lead_events", "payload") && hasColumn(ctx, pool, "lead_events", "details") {
		if _, err := pool.Exec(ctx, `
			UPDATE lead_events
			SET details = CASE
				WHEN details = '{}'::jsonb OR details IS NULL THEN payload
				ELSE details
			END
			WHERE (details = '{}'::jsonb OR details IS NULL) AND payload IS NOT NULL
		`); err != nil {
			return err
		}
	}

	if err := backfillConversationColumns(ctx, pool); err != nil {
		return err
	}
	if err := backfillLeadColumns(ctx, pool); err != nil {
		return err
	}

	if _, err := pool.Exec(ctx, `UPDATE leads SET priority = 'normal' WHERE priority IS NULL OR priority = ''`); err != nil {
		return err
	}

	return nil
}

func backfillConversationColumns(ctx context.Context, pool *pgxpool.Pool) error {
	if !hasColumn(ctx, pool, "conversations", "landing_slug") || !hasColumn(ctx, pool, "conversations", "landing_url") {
		return nil
	}

	rows, err := pool.Query(ctx, `
		SELECT id, landing_url
		FROM conversations
		WHERE landing_slug = '' OR landing_slug IS NULL
	`)
	if err != nil {
		return err
	}
	defer rows.Close()

	type conversationLanding struct {
		id         string
		landingURL string
	}

	items := make([]conversationLanding, 0)
	for rows.Next() {
		var item conversationLanding
		if err := rows.Scan(&item.id, &item.landingURL); err != nil {
			return err
		}
		items = append(items, item)
	}
	if err := rows.Err(); err != nil {
		return err
	}

	for _, item := range items {
		landingSlug := landingSlugFromURL(item.landingURL)
		if landingSlug == "" {
			landingSlug = "home"
		}

		if _, err := pool.Exec(ctx, `
			UPDATE conversations
			SET landing_slug = $2
			WHERE id = $1
		`, item.id, landingSlug); err != nil {
			return err
		}
	}

	if hasColumn(ctx, pool, "conversations", "last_message_at") {
		if _, err := pool.Exec(ctx, `
			UPDATE conversations
			SET last_message_at = COALESCE(updated_at, created_at, last_message_at)
		`); err != nil {
			return err
		}
	}

	return nil
}

func backfillLeadColumns(ctx context.Context, pool *pgxpool.Pool) error {
	if hasColumn(ctx, pool, "leads", "conversation_id") && hasColumn(ctx, pool, "conversations", "lead_id") {
		if _, err := pool.Exec(ctx, `
			UPDATE leads AS l
			SET conversation_id = c.id
			FROM conversations AS c
			WHERE l.conversation_id IS NULL
			  AND c.lead_id = l.id
		`); err != nil {
			return err
		}
	}

	if hasColumn(ctx, pool, "leads", "bot_slug") && hasColumn(ctx, pool, "conversations", "bot_slug") {
		if _, err := pool.Exec(ctx, `
			UPDATE leads AS l
			SET bot_slug = COALESCE(NULLIF(l.bot_slug, ''), c.bot_slug, 'home')
			FROM conversations AS c
			WHERE l.conversation_id IS NOT NULL
			  AND c.id = l.conversation_id
		`); err != nil {
			return err
		}
	}

	if hasColumn(ctx, pool, "leads", "landing_slug") && hasColumn(ctx, pool, "conversations", "landing_slug") {
		if _, err := pool.Exec(ctx, `
			UPDATE leads AS l
			SET landing_slug = COALESCE(NULLIF(l.landing_slug, ''), NULLIF(c.landing_slug, ''))
			FROM conversations AS c
			WHERE l.conversation_id IS NOT NULL
			  AND c.id = l.conversation_id
		`); err != nil {
			return err
		}
	}

	if hasColumn(ctx, pool, "leads", "landing_slug") && hasColumn(ctx, pool, "leads", "landing_url") {
		rows, err := pool.Query(ctx, `
			SELECT id, landing_url
			FROM leads
			WHERE landing_slug = '' OR landing_slug IS NULL
		`)
		if err != nil {
			return err
		}
		defer rows.Close()

		type leadLanding struct {
			id         string
			landingURL string
		}

		items := make([]leadLanding, 0)
		for rows.Next() {
			var item leadLanding
			if err := rows.Scan(&item.id, &item.landingURL); err != nil {
				return err
			}
			items = append(items, item)
		}
		if err := rows.Err(); err != nil {
			return err
		}

		for _, item := range items {
			landingSlug := landingSlugFromURL(item.landingURL)
			if landingSlug == "" {
				landingSlug = "home"
			}

			if _, err := pool.Exec(ctx, `
				UPDATE leads
				SET landing_slug = $2
				WHERE id = $1
			`, item.id, landingSlug); err != nil {
				return err
			}
		}
	}

	return nil
}

func hasColumn(ctx context.Context, pool *pgxpool.Pool, tableName, columnName string) bool {
	var exists bool
	err := pool.QueryRow(ctx, `
		SELECT EXISTS (
			SELECT 1
			FROM information_schema.columns
			WHERE table_schema = current_schema()
			  AND table_name = $1
			  AND column_name = $2
		)
	`, strings.ToLower(tableName), strings.ToLower(columnName)).Scan(&exists)
	if err != nil {
		return false
	}
	return exists
}

func landingSlugFromURL(raw string) string {
	trimmed := strings.TrimSpace(raw)
	if trimmed == "" {
		return ""
	}

	if parsed, err := url.Parse(trimmed); err == nil && parsed.Scheme != "" {
		trimmed = parsed.Path
	}

	trimmed = strings.Trim(trimmed, "/")
	if trimmed == "" {
		return "home"
	}

	parts := strings.Split(trimmed, "/")
	candidate := strings.TrimSpace(parts[0])
	if candidate == "" {
		return "home"
	}

	candidate = strings.ToLower(candidate)
	candidate = strings.ReplaceAll(candidate, "_", "-")
	return path.Clean("/" + candidate)[1:]
}
