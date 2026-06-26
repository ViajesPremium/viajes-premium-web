package main

import (
	"context"
	"log"
	"time"

	chatapp "backend/internal/chat/application"
	chatknowledge "backend/internal/chat/infrastructure/knowledge"
	chatllm "backend/internal/chat/infrastructure/llm"
	chatpg "backend/internal/chat/infrastructure/postgres"
	chathttp "backend/internal/chat/presentation/http"
	leadapp "backend/internal/leads/application"
	leadpg "backend/internal/leads/infrastructure/postgres"
	"backend/internal/leads/infrastructure/smtp"
	leadhttp "backend/internal/leads/presentation/http"
	"backend/internal/platform/config"
	platformdb "backend/internal/platform/database"
	platformhttp "backend/internal/platform/http"
)

func main() {
	cfg := config.Load()

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if cfg.DatabaseURL == "" {
		log.Fatal("configuracion de base de datos no configurada: define DATABASE_URL o DB_HOST/DB_PORT/DB_USER/DB_PASSWORD/DB_NAME")
	}

	db, err := platformdb.OpenPostgres(ctx, cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("unable to connect to postgres: %v", err)
	}
	defer db.Close()

	if err := chatpg.EnsureSchema(ctx, db); err != nil {
		log.Fatalf("unable to ensure chat schema: %v", err)
	}

	mailer := smtp.NewMailer(smtp.Config{
		Host:         cfg.SMTP.Host,
		Port:         cfg.SMTP.Port,
		Secure:       cfg.SMTP.Secure,
		Username:     cfg.SMTP.Username,
		Password:     cfg.SMTP.Password,
		FromEmail:    cfg.SMTP.FromEmail,
		ToEmail:      cfg.SMTP.ToEmail,
		ArchiveEmail: cfg.SMTP.ArchiveEmail,
	})

	leadStore := leadpg.NewLeadStore(db)
	service := leadapp.NewSubmitLeadService(mailer, leadStore)
	handler := leadhttp.NewHandler(service)
	knowledgeStore := chatknowledge.NewEmbeddedStore()
	llmClient := chatllm.NewClient(chatllm.Config{
		BaseURL:    cfg.Chat.LLMBaseURL,
		APIKey:     cfg.Chat.LLMAPIKey,
		Model:      cfg.Chat.LLMModel,
		Timeout:    time.Duration(cfg.Chat.LLMTimeoutSecs) * time.Second,
		Enabled:    cfg.Chat.LLMAPIKey != "",
		SystemName: "Viajes Premium",
	})
	if !llmClient.Enabled() {
		log.Print("LLM no configurado o no disponible; el backend iniciara con respuestas locales por reglas.")
	}

	chatService := chatapp.NewService(chatapp.Deps{
		Knowledge:         knowledgeStore,
		ConversationRepo:  chatpg.NewConversationRepository(db),
		MessageRepo:       chatpg.NewMessageRepository(db),
		LeadRepo:          chatpg.NewLeadRepository(db),
		LeadEventRepo:     chatpg.NewLeadEventRepository(db),
		LeadEmailSender:   mailer,
		LLM:               llmClient,
		DefaultBotSlug:    cfg.Chat.DefaultBotSlug,
		HandoffThreshold:  cfg.Chat.HandoffThreshold,
		LeadEmailsEnabled: cfg.Chat.LeadEmailsEnabled,
	})
	chatHandler := chathttp.NewHandler(chatService)
	if cfg.Chat.LeadEmailsEnabled {
		go startBotLeadEmailWorker(context.Background(), chatService)
	} else {
		log.Print("Bot lead emails deshabilitados por configuracion.")
	}
	router := platformhttp.NewRouter(cfg, handler, chatHandler)

	log.Printf("API listening on %s", cfg.Address())
	if err := router.Run(cfg.Address()); err != nil {
		log.Fatalf("unable to start API: %v", err)
	}
}
