package config

import (
	"net/url"
	"os"
	"strconv"
	"strings"
)

type Config struct {
	AppEnv         string
	Port           string
	AllowedOrigins []string
	DatabaseURL    string
	Chat           ChatConfig
	SMTP           SMTPConfig
}

type ChatConfig struct {
	LLMBaseURL        string
	LLMAPIKey         string
	LLMModel          string
	LLMTimeoutSecs    int
	DefaultBotSlug    string
	HandoffThreshold  int
	LeadEmailsEnabled bool
}

type SMTPConfig struct {
	Host         string
	Port         int
	Secure       bool
	Username     string
	Password     string
	FromEmail    string
	ToEmail      string
	ArchiveEmail string
}

func Load() Config {
	loadDotEnvFiles()

	fromEmail := sanitizeEnv(os.Getenv("SMTP_FROM_EMAIL"))
	if fromEmail == "" {
		fromEmail = "reservaciones@viajespremium.com.mx"
	}

	toEmail := sanitizeEnv(os.Getenv("SMTP_TO_EMAIL"))
	if toEmail == "" {
		toEmail = "grupo-santa-f@add.nocrm.io"
	}

	smtpPort := 465
	if parsed, err := strconv.Atoi(firstNonEmpty(sanitizeEnv(os.Getenv("SMTP_PORT")), "465")); err == nil && parsed > 0 {
		smtpPort = parsed
	}

	return Config{
		AppEnv:         firstNonEmpty(sanitizeEnv(os.Getenv("APP_ENV")), "development"),
		Port:           firstNonEmpty(sanitizeEnv(os.Getenv("APP_PORT")), sanitizeEnv(os.Getenv("PORT")), "8080"),
		AllowedOrigins: parseCSVEnv("ALLOWED_ORIGINS"),
		DatabaseURL:    resolveDatabaseURL(),
		Chat: ChatConfig{
			LLMBaseURL:        firstNonEmpty(sanitizeEnv(os.Getenv("LLM_BASE_URL")), "https://api.openai.com/v1"),
			LLMAPIKey:         sanitizeEnv(os.Getenv("LLM_API_KEY")),
			LLMModel:          firstNonEmpty(sanitizeEnv(os.Getenv("LLM_MODEL")), "gpt-4.1-mini"),
			LLMTimeoutSecs:    mustInt(firstNonEmpty(sanitizeEnv(os.Getenv("LLM_TIMEOUT_SECS")), "30"), 30),
			DefaultBotSlug:    firstNonEmpty(sanitizeEnv(os.Getenv("CHAT_DEFAULT_BOT_SLUG")), "home"),
			HandoffThreshold:  mustInt(firstNonEmpty(sanitizeEnv(os.Getenv("CHAT_HANDOFF_THRESHOLD")), "70"), 70),
			LeadEmailsEnabled: mustBool(firstNonEmpty(sanitizeEnv(os.Getenv("CHAT_LEAD_EMAILS_ENABLED")), "true"), true),
		},
		SMTP: SMTPConfig{
			Host:         firstNonEmpty(sanitizeEnv(os.Getenv("SMTP_HOST")), "smtp.hostinger.com"),
			Port:         smtpPort,
			Secure:       strings.ToLower(firstNonEmpty(sanitizeEnv(os.Getenv("SMTP_SECURE")), "true")) != "false",
			Username:     sanitizeEnv(os.Getenv("SMTP_USER")),
			Password:     sanitizeEnv(os.Getenv("SMTP_PASS")),
			FromEmail:    fromEmail,
			ToEmail:      toEmail,
			ArchiveEmail: firstNonEmpty(sanitizeEnv(os.Getenv("SMTP_ARCHIVE_EMAIL")), fromEmail),
		},
	}
}

func resolveDatabaseURL() string {
	if raw := sanitizeEnv(os.Getenv("DATABASE_URL")); raw != "" {
		return raw
	}

	host := firstNonEmpty(sanitizeEnv(os.Getenv("DB_HOST")), "127.0.0.1")
	port := firstNonEmpty(sanitizeEnv(os.Getenv("DB_PORT")), "5432")
	user := sanitizeEnv(os.Getenv("DB_USER"))
	password := sanitizeEnv(os.Getenv("DB_PASSWORD"))
	name := sanitizeEnv(os.Getenv("DB_NAME"))
	sslmode := firstNonEmpty(sanitizeEnv(os.Getenv("DB_SSLMODE")), "disable")
	timezone := firstNonEmpty(sanitizeEnv(os.Getenv("DB_TIMEZONE")), "UTC")

	if user == "" || name == "" {
		return ""
	}

	dsn := &url.URL{
		Scheme: "postgres",
		Host:   host + ":" + port,
		Path:   "/" + strings.TrimPrefix(name, "/"),
	}
	if password != "" {
		dsn.User = url.UserPassword(user, password)
	} else {
		dsn.User = url.User(user)
	}

	query := dsn.Query()
	query.Set("sslmode", sslmode)
	if timezone != "" {
		query.Set("options", "-c TimeZone="+timezone)
	}
	dsn.RawQuery = query.Encode()

	return dsn.String()
}

func (c Config) Address() string {
	return ":" + c.Port
}

func parseCSVEnv(key string) []string {
	raw := sanitizeEnv(os.Getenv(key))
	if raw == "" {
		return nil
	}

	parts := strings.FieldsFunc(raw, func(r rune) bool {
		return r == ',' || r == ';'
	})

	origins := make([]string, 0, len(parts))
	for _, part := range parts {
		value := strings.TrimSpace(part)
		if value != "" {
			origins = append(origins, value)
		}
	}

	return origins
}

func firstNonEmpty(values ...string) string {
	for _, value := range values {
		if strings.TrimSpace(value) != "" {
			return value
		}
	}
	return ""
}

func sanitizeEnv(value string) string {
	next := strings.TrimSpace(value)
	if len(next) >= 2 {
		if (next[0] == '"' && next[len(next)-1] == '"') || (next[0] == '\'' && next[len(next)-1] == '\'') {
			next = next[1 : len(next)-1]
		}
	}

	next = strings.ReplaceAll(next, `\$`, "$")
	next = strings.Map(func(r rune) rune {
		switch r {
		case '\u200B', '\u200C', '\u200D', '\uFEFF':
			return -1
		default:
			return r
		}
	}, next)

	return next
}

func mustInt(raw string, fallback int) int {
	parsed, err := strconv.Atoi(raw)
	if err != nil || parsed <= 0 {
		return fallback
	}
	return parsed
}

func mustBool(raw string, fallback bool) bool {
	normalized := strings.ToLower(strings.TrimSpace(raw))
	switch normalized {
	case "true", "1", "yes", "y", "on":
		return true
	case "false", "0", "no", "n", "off":
		return false
	default:
		return fallback
	}
}
