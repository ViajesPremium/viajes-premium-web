package llm

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	app "backend/internal/chat/application"
	"backend/internal/chat/domain"
)

func TestResolveChatCompletionsURL(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name     string
		raw      string
		expected string
	}{
		{
			name:     "openai base path",
			raw:      "https://api.openai.com/v1",
			expected: "https://api.openai.com/v1/chat/completions",
		},
		{
			name:     "full chat completions path",
			raw:      "https://api.deepseek.com/chat/completions",
			expected: "https://api.deepseek.com/chat/completions",
		},
		{
			name:     "root path",
			raw:      "https://api.deepseek.com",
			expected: "https://api.deepseek.com/chat/completions",
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			got, err := resolveChatCompletionsURL(tt.raw)
			if err != nil {
				t.Fatalf("resolveChatCompletionsURL returned error: %v", err)
			}
			if got != tt.expected {
				t.Fatalf("resolveChatCompletionsURL() = %q, want %q", got, tt.expected)
			}
		})
	}
}

func TestGenerateUsesResolvedEndpoint(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name         string
		baseURL      string
		expectedPath string
	}{
		{
			name:         "base url with v1",
			baseURL:      "/v1",
			expectedPath: "/v1/chat/completions",
		},
		{
			name:         "full endpoint",
			baseURL:      "/chat/completions",
			expectedPath: "/chat/completions",
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			var handlerErr error
			done := make(chan struct{})
			server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				defer close(done)

				if r.URL.Path != tt.expectedPath {
					handlerErr = fmt.Errorf("unexpected path: got %q want %q", r.URL.Path, tt.expectedPath)
				}
				if got := r.Header.Get("Authorization"); got != "Bearer test-key" {
					handlerErr = fmt.Errorf("unexpected authorization header: %q", got)
				}

				var payload map[string]any
				if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
					handlerErr = fmt.Errorf("decode payload: %v", err)
				} else if got := payload["model"]; got != "test-model" {
					handlerErr = fmt.Errorf("unexpected model: %#v", got)
				}

				w.Header().Set("Content-Type", "application/json")
				_, _ = w.Write([]byte(`{"choices":[{"message":{"content":"Hola"}}]}`))
			}))
			t.Cleanup(server.Close)

			client := NewClient(Config{
				BaseURL: server.URL + tt.baseURL,
				APIKey:  "test-key",
				Model:   "test-model",
				Enabled: true,
				Timeout: 5 * time.Second,
			})

			resp, err := client.Generate(context.Background(), app.PromptRequest{
				SystemPrompt: "system",
				Messages: []app.PromptMessage{
					{Role: domain.RoleUser, Content: "Hola"},
				},
				MaxTokens:   100,
				Temperature: 0.2,
			})
			if err != nil {
				t.Fatalf("Generate() error = %v", err)
			}
			select {
			case <-done:
			case <-time.After(3 * time.Second):
				t.Fatal("timed out waiting for server handler")
			}
			if handlerErr != nil {
				t.Fatal(handlerErr)
			}
			if strings.TrimSpace(resp.Text) != "Hola" {
				t.Fatalf("Generate() text = %q, want %q", resp.Text, "Hola")
			}
			if resp.Source != "llm" {
				t.Fatalf("Generate() source = %q, want %q", resp.Source, "llm")
			}
		})
	}
}
