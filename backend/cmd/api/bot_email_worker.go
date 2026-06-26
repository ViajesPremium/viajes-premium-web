package main

import (
	"context"
	"log"
	"time"

	chatapp "backend/internal/chat/application"
)

func startBotLeadEmailWorker(ctx context.Context, service *chatapp.Service) {
	ticker := time.NewTicker(30 * time.Second)
	defer ticker.Stop()

	for {
		if processed, err := service.ProcessPendingBotLeadEmails(ctx, 20); err != nil {
			log.Printf("bot lead email worker error: %v", err)
		} else if processed > 0 {
			log.Printf("bot lead email worker processed %d lead(s)", processed)
		}

		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
		}
	}
}