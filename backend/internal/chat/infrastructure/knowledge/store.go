package knowledge

import (
	"context"
	"embed"
	"encoding/json"
	"fmt"
	"path"
	"strings"
	"sync"

	"backend/internal/chat/domain"
)

//go:embed *.json *.prompt.txt
var knowledgeFS embed.FS

type EmbeddedStore struct {
	once sync.Once
	bots map[string]domain.BotKnowledge
	err  error
}

func NewEmbeddedStore() *EmbeddedStore {
	return &EmbeddedStore{bots: map[string]domain.BotKnowledge{}}
}

func (s *EmbeddedStore) Get(_ context.Context, slug string) (domain.BotKnowledge, error) {
	if err := s.load(); err != nil {
		return domain.BotKnowledge{}, err
	}

	key := normalizeSlug(slug)
	if bot, ok := s.bots[key]; ok {
		return bot, nil
	}
	if bot, ok := s.bots["home"]; ok {
		return bot, nil
	}
	return domain.BotKnowledge{}, fmt.Errorf("knowledge not found for slug %q", slug)
}

func (s *EmbeddedStore) List(_ context.Context) ([]domain.BotKnowledge, error) {
	if err := s.load(); err != nil {
		return nil, err
	}

	items := make([]domain.BotKnowledge, 0, len(s.bots))
	for _, bot := range s.bots {
		items = append(items, bot)
	}
	return items, nil
}

func (s *EmbeddedStore) load() error {
	s.once.Do(func() {
		entries, err := knowledgeFS.ReadDir(".")
		if err != nil {
			s.err = err
			return
		}

		for _, entry := range entries {
			if entry.IsDir() || !strings.HasSuffix(entry.Name(), ".json") {
				continue
			}

			content, err := knowledgeFS.ReadFile(entry.Name())
			if err != nil {
				s.err = err
				return
			}

			var bot domain.BotKnowledge
			if err := json.Unmarshal(content, &bot); err != nil {
				s.err = fmt.Errorf("invalid knowledge file %s: %w", entry.Name(), err)
				return
			}

			if bot.Slug == "" {
				bot.Slug = strings.TrimSuffix(path.Base(entry.Name()), ".json")
			}
			bot.BehaviorPrompt = readBehaviorPrompt(entry.Name())
			s.bots[normalizeSlug(bot.Slug)] = bot
		}
	})
	return s.err
}

func readBehaviorPrompt(jsonName string) string {
	base := strings.TrimSuffix(path.Base(jsonName), ".json")
	promptName := base + ".prompt.txt"

	content, err := knowledgeFS.ReadFile(promptName)
	if err != nil {
		return ""
	}

	return strings.TrimSpace(string(content))
}

func normalizeSlug(value string) string {
	value = strings.TrimSpace(strings.ToLower(value))
	value = strings.ReplaceAll(value, "_", "-")
	return value
}
