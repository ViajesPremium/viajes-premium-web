package knowledge

import (
	"context"
	"strings"
	"testing"
)

func TestEmbeddedStoreLoadsBehaviorPrompt(t *testing.T) {
	store := NewEmbeddedStore()

	bot, err := store.Get(context.Background(), "japon-premium")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if strings.TrimSpace(bot.BehaviorPrompt) == "" {
		t.Fatal("expected behavior prompt to be loaded")
	}
	if !strings.Contains(strings.ToLower(bot.BehaviorPrompt), "concierge") {
		t.Fatalf("expected behavior prompt to contain concierge instructions, got: %q", bot.BehaviorPrompt)
	}
	if strings.TrimSpace(bot.MasterPrompt) == "" {
		t.Fatal("expected master prompt from json to remain available")
	}
}
