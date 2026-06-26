package postgres

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
)

func EnsureSchema(ctx context.Context, pool *pgxpool.Pool) error {
	statements := []string{
		`CREATE TABLE IF NOT EXISTS conversations (
			id text PRIMARY KEY,
			bot_slug text NOT NULL,
			session_id text NOT NULL,
			landing_url text NOT NULL DEFAULT '',
			landing_slug text NOT NULL DEFAULT '',
			stage text NOT NULL DEFAULT 'new',
			score integer NOT NULL DEFAULT 0,
			lead_id text,
			summary text NOT NULL DEFAULT '',
			metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
			last_message_at timestamptz NOT NULL DEFAULT now(),
			created_at timestamptz NOT NULL DEFAULT now(),
			updated_at timestamptz NOT NULL DEFAULT now(),
			UNIQUE (bot_slug, session_id)
		);`,
		`CREATE TABLE IF NOT EXISTS leads (
			id text PRIMARY KEY,
			conversation_id text NOT NULL UNIQUE REFERENCES conversations(id) ON DELETE CASCADE,
			bot_slug text NOT NULL,
			landing_slug text NOT NULL DEFAULT '',
			attribution jsonb NOT NULL DEFAULT '{}'::jsonb,
			name text NOT NULL DEFAULT '',
			email text NOT NULL DEFAULT '',
			phone text NOT NULL DEFAULT '',
			interest text NOT NULL DEFAULT '',
			travelers text NOT NULL DEFAULT '',
			preferred_contact_time text NOT NULL DEFAULT '',
			travel_date text NOT NULL DEFAULT '',
			priority text NOT NULL DEFAULT 'normal',
			special_occasion text NOT NULL DEFAULT '',
			score integer NOT NULL DEFAULT 0,
			stage text NOT NULL DEFAULT 'new',
			handoff_required boolean NOT NULL DEFAULT false,
			handoff_reason text NOT NULL DEFAULT '',
			bot_email_due_at timestamptz,
			bot_email_sent_at timestamptz,
			bot_email_message_id text NOT NULL DEFAULT '',
			created_at timestamptz NOT NULL DEFAULT now(),
			updated_at timestamptz NOT NULL DEFAULT now()
		);`,
		`CREATE TABLE IF NOT EXISTS messages (
			id text PRIMARY KEY,
			conversation_id text NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
			role text NOT NULL,
			content text NOT NULL,
			source text NOT NULL DEFAULT '',
			metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
			created_at timestamptz NOT NULL DEFAULT now()
		);`,
		`CREATE INDEX IF NOT EXISTS idx_messages_conversation_created_at ON messages(conversation_id, created_at DESC);`,
		`CREATE TABLE IF NOT EXISTS lead_events (
			id text PRIMARY KEY,
			lead_id text NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
			event_type text NOT NULL,
			details jsonb NOT NULL DEFAULT '{}'::jsonb,
			created_at timestamptz NOT NULL DEFAULT now()
		);`,
		`CREATE INDEX IF NOT EXISTS idx_lead_events_lead_created_at ON lead_events(lead_id, created_at DESC);`,
	}

	for _, statement := range statements {
		if _, err := pool.Exec(ctx, statement); err != nil {
			return err
		}
	}
	return applySchemaCompatibilityMigrations(ctx, pool)
}
