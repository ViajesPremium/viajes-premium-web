-- Legacy compatibility migration.
-- Safe to run on a database that was created with the previous lead/chat schema.

ALTER TABLE conversations ADD COLUMN IF NOT EXISTS landing_slug text NOT NULL DEFAULT '';
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS score integer NOT NULL DEFAULT 0;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS last_message_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE leads ADD COLUMN IF NOT EXISTS conversation_id text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS bot_slug text NOT NULL DEFAULT 'home';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS landing_slug text NOT NULL DEFAULT '';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS score integer NOT NULL DEFAULT 0;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS stage text NOT NULL DEFAULT 'new';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS travelers text NOT NULL DEFAULT '';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS preferred_contact_time text NOT NULL DEFAULT '';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS travel_date text NOT NULL DEFAULT '';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS special_occasion text NOT NULL DEFAULT '';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS handoff_required boolean NOT NULL DEFAULT false;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS handoff_reason text NOT NULL DEFAULT '';
ALTER TABLE messages ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT '';
ALTER TABLE lead_events ADD COLUMN IF NOT EXISTS details jsonb NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE leads ALTER COLUMN session_id DROP NOT NULL;
ALTER TABLE conversations ALTER COLUMN lead_id DROP NOT NULL;
ALTER TABLE conversations ALTER COLUMN stage SET DEFAULT 'new';

CREATE UNIQUE INDEX IF NOT EXISTS conversations_bot_slug_session_id_key ON conversations (bot_slug, session_id);
CREATE UNIQUE INDEX IF NOT EXISTS leads_conversation_id_key ON leads (conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created_at ON messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lead_events_lead_created_at ON lead_events(lead_id, created_at DESC);
