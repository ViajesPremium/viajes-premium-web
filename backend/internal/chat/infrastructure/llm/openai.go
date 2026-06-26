package llm

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"

	app "backend/internal/chat/application"
)

type Config struct {
	BaseURL    string
	APIKey     string
	Model      string
	Timeout    time.Duration
	Enabled    bool
	SystemName string
}

type Client struct {
	cfg        Config
	httpClient *http.Client
}

func NewClient(cfg Config) *Client {
	timeout := cfg.Timeout
	if timeout <= 0 {
		timeout = 30 * time.Second
	}
	return &Client{
		cfg: cfg,
		httpClient: &http.Client{
			Timeout: timeout,
		},
	}
}

func (c *Client) Enabled() bool {
	return c.cfg.Enabled && strings.TrimSpace(c.cfg.APIKey) != "" && strings.TrimSpace(c.cfg.Model) != "" && isValidBaseURL(c.cfg.BaseURL)
}

func (c *Client) Generate(ctx context.Context, req app.PromptRequest) (app.LLMResponse, error) {
	if !c.Enabled() {
		return app.LLMResponse{}, errors.New("llm disabled")
	}

	payload := map[string]any{
		"model":       c.cfg.Model,
		"temperature": req.Temperature,
		"max_tokens":  req.MaxTokens,
		"messages":    buildMessages(req),
	}

	body, err := json.Marshal(payload)
	if err != nil {
		return app.LLMResponse{}, err
	}

	endpoint, err := resolveChatCompletionsURL(c.cfg.BaseURL)
	if err != nil {
		return app.LLMResponse{}, err
	}

	request, err := http.NewRequestWithContext(ctx, http.MethodPost, endpoint, bytes.NewReader(body))
	if err != nil {
		return app.LLMResponse{}, err
	}
	request.Header.Set("Content-Type", "application/json")
	request.Header.Set("Authorization", "Bearer "+c.cfg.APIKey)

	response, err := c.httpClient.Do(request)
	if err != nil {
		return app.LLMResponse{}, err
	}
	defer response.Body.Close()

	if response.StatusCode < 200 || response.StatusCode >= 300 {
		errorBody, _ := io.ReadAll(io.LimitReader(response.Body, 4096))
		if trimmed := strings.TrimSpace(string(errorBody)); trimmed != "" {
			return app.LLMResponse{}, fmt.Errorf("llm request failed at %s: %s: %s", endpoint, response.Status, trimmed)
		}
		return app.LLMResponse{}, fmt.Errorf("llm request failed at %s: %s", endpoint, response.Status)
	}

	var parsed struct {
		Choices []struct {
			Message struct {
				Content string `json:"content"`
			} `json:"message"`
		} `json:"choices"`
	}
	if err := json.NewDecoder(response.Body).Decode(&parsed); err != nil {
		return app.LLMResponse{}, err
	}
	if len(parsed.Choices) == 0 {
		return app.LLMResponse{}, errors.New("llm response without choices")
	}

	text := strings.TrimSpace(parsed.Choices[0].Message.Content)
	if text == "" {
		return app.LLMResponse{}, errors.New("llm response without content")
	}

	return app.LLMResponse{Text: text, Source: "llm"}, nil
}

func resolveChatCompletionsURL(raw string) (string, error) {
	trimmed := strings.TrimSpace(raw)
	if trimmed == "" {
		return "", errors.New("llm base url is empty")
	}

	parsed, err := url.Parse(trimmed)
	if err != nil {
		return "", fmt.Errorf("invalid llm base url: %w", err)
	}
	if parsed.Scheme == "" || parsed.Host == "" {
		return "", fmt.Errorf("invalid llm base url: %s", trimmed)
	}

	path := strings.TrimRight(parsed.Path, "/")
	if !strings.HasSuffix(path, "/chat/completions") {
		if path == "" {
			path = "/chat/completions"
		} else {
			path = path + "/chat/completions"
		}
	}
	parsed.Path = path

	return parsed.String(), nil
}

func isValidBaseURL(raw string) bool {
	_, err := resolveChatCompletionsURL(raw)
	return err == nil
}

func buildMessages(req app.PromptRequest) []map[string]string {
	messages := make([]map[string]string, 0, len(req.Messages)+1)
	messages = append(messages, map[string]string{"role": "system", "content": req.SystemPrompt})
	for _, message := range req.Messages {
		role := string(message.Role)
		if role == "" {
			continue
		}
		messages = append(messages, map[string]string{
			"role":    role,
			"content": message.Content,
		})
	}
	return messages
}
