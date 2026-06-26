package application

import (
	"context"
	"errors"
	"strings"
	"testing"
	"time"

	"backend/internal/leads/application/dto"
	"backend/internal/leads/domain"
)

type mailerStub struct {
	messageID string
	err       error
	last      EmailMessage
}

func (m *mailerStub) SendLeadEmail(_ context.Context, message EmailMessage) (string, error) {
	m.last = message
	return m.messageID, m.err
}

type leadStoreStub struct {
	calls int
	last  domain.Lead
	err   error
}

func (s *leadStoreStub) SaveLead(_ context.Context, lead *domain.Lead) error {
	s.calls++
	if lead != nil {
		s.last = *lead
	}
	return s.err
}

type confirmationMailerStub struct {
	leadMessageID string
	calls         int
	last          EmailMessage
}

func (m *confirmationMailerStub) SendLeadEmail(_ context.Context, message EmailMessage) (string, error) {
	m.last = message
	if m.leadMessageID == "" {
		m.leadMessageID = "lead-1"
	}
	return m.leadMessageID, nil
}

func (m *confirmationMailerStub) SendConfirmationEmail(_ context.Context, message EmailMessage) (string, error) {
	m.calls++
	m.last = message
	return "confirmation-1", nil
}

func TestSubmitLeadServiceRejectsInvalidRequests(t *testing.T) {
	t.Run("honeypot", func(t *testing.T) {
		service := NewSubmitLeadService(&mailerStub{})
		service.now = func() time.Time { return time.UnixMilli(10_000) }
		service.newID = func() string { return "req-1" }

		_, err := service.Execute(context.Background(), dto.SubmitLeadCommand{
			Name:         "Ana",
			Phone:        "+525511111111",
			Email:        "ana@example.com",
			Honeypot:     "bot",
			FormLoadedAt: 1_000,
		})

		if !errors.Is(err, ErrInvalidRequest) {
			t.Fatalf("expected ErrInvalidRequest, got %v", err)
		}
	})

	t.Run("too fast", func(t *testing.T) {
		service := NewSubmitLeadService(&mailerStub{})
		service.now = func() time.Time { return time.UnixMilli(10_000) }
		service.newID = func() string { return "req-2" }

		_, err := service.Execute(context.Background(), dto.SubmitLeadCommand{
			Name:         "Ana",
			Phone:        "+525511111111",
			Email:        "ana@example.com",
			FormLoadedAt: 8_500,
		})

		if !errors.Is(err, ErrInvalidRequest) {
			t.Fatalf("expected ErrInvalidRequest, got %v", err)
		}
	})
}

func TestSubmitLeadServiceBuildsLeadEmail(t *testing.T) {
	mailer := &mailerStub{messageID: "message-1"}
	leadStore := &leadStoreStub{}
	service := NewSubmitLeadService(mailer, leadStore)
	service.now = func() time.Time {
		return time.Date(2026, time.June, 18, 20, 45, 0, 0, time.UTC)
	}
	service.newID = func() string { return "req-abc" }

	result, err := service.Execute(context.Background(), dto.SubmitLeadCommand{
		Name:         "Ana Perez",
		Phone:        "+525511111111",
		Email:        "ana@example.com",
		CRMTag:       "#tags:Japon Premium",
		FormID:       "whatsapp-fab-japon-premium",
		PagePath:     "/japon-premium",
		FormLoadedAt: time.Date(2026, time.June, 18, 20, 44, 0, 0, time.UTC).UnixMilli(),
		TravelDate:   "2026-12-01",
		TravelWishes: "Ruta cultural",
		Attribution: dto.AttributionDTO{
			UTMSource:   "google",
			Destination: "japon",
			LandingSlug: "japon-premium",
		},
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if result.RequestID != "req-abc" {
		t.Fatalf("unexpected request id: %s", result.RequestID)
	}
	if result.MessageID != "message-1" {
		t.Fatalf("unexpected message id: %s", result.MessageID)
	}
	if leadStore.calls != 1 {
		t.Fatalf("expected lead to be persisted once, got %d", leadStore.calls)
	}
	if leadStore.last.ID == "" || leadStore.last.ConversationID == "" {
		t.Fatalf("expected persisted lead to include ids, got %#v", leadStore.last)
	}
	if leadStore.last.ID != leadStore.last.ConversationID {
		t.Fatalf("expected lead and conversation ids to match, got %q vs %q", leadStore.last.ID, leadStore.last.ConversationID)
	}
	if leadStore.last.BotSlug != "japon-premium" {
		t.Fatalf("expected bot slug to be derived from page path, got %q", leadStore.last.BotSlug)
	}
	if mailer.last.Subject != "Cotización LP Japón PREMIUM ® Whatsapp" {
		t.Fatalf("expected backend to build subject, got %q", mailer.last.Subject)
	}
	if !strings.Contains(mailer.last.TextBody, "Fecha tentativa") {
		t.Fatalf("expected text body to include extra lead data")
	}
	if !strings.Contains(mailer.last.HTMLBody, "Ruta cultural") {
		t.Fatalf("expected html body to include interest")
	}
}

func TestSubmitLeadServiceBuildsFirstFormSubject(t *testing.T) {
	mailer := &mailerStub{messageID: "message-2"}
	leadStore := &leadStoreStub{}
	service := NewSubmitLeadService(mailer, leadStore)
	service.now = func() time.Time { return time.UnixMilli(20_000) }
	service.newID = func() string { return "req-web" }

	_, err := service.Execute(context.Background(), dto.SubmitLeadCommand{
		Name:         "Ana Perez",
		Phone:        "+525511111111",
		Email:        "ana@example.com",
		CRMTag:       "#tags:Japon Premium",
		FormID:       "first-form",
		PagePath:     "/japon-premium",
		FormLoadedAt: 10_000,
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if mailer.last.Subject != "Cotización LP Japón PREMIUM ® Primer Formulario" {
		t.Fatalf("expected first form subject, got %q", mailer.last.Subject)
	}
	if leadStore.calls != 1 {
		t.Fatalf("expected lead persistence once for first form, got %d", leadStore.calls)
	}
}

func TestSubmitLeadServiceBuildsSecondFormSubject(t *testing.T) {
	mailer := &mailerStub{messageID: "message-3"}
	leadStore := &leadStoreStub{}
	service := NewSubmitLeadService(mailer, leadStore)
	service.now = func() time.Time { return time.UnixMilli(30_000) }
	service.newID = func() string { return "req-second" }

	_, err := service.Execute(context.Background(), dto.SubmitLeadCommand{
		Name:         "Ana Perez",
		Phone:        "+525511111111",
		Email:        "ana@example.com",
		CRMTag:       "#tags:Japon Premium",
		FormID:       "second-form",
		PagePath:     "/japon-premium",
		FormLoadedAt: 20_000,
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if mailer.last.Subject != "Cotización LP Japón PREMIUM ® Segundo Formulario" {
		t.Fatalf("expected second form subject, got %q", mailer.last.Subject)
	}
}

func TestSubmitLeadServiceAllowsOptionalEmailAndSkipsConfirmation(t *testing.T) {
	mailer := &confirmationMailerStub{}
	leadStore := &leadStoreStub{}
	service := NewSubmitLeadService(mailer, leadStore)
	service.now = func() time.Time { return time.Date(2026, time.June, 18, 20, 45, 0, 0, time.UTC) }
	service.newID = func() string { return "req-no-email" }

	result, err := service.Execute(context.Background(), dto.SubmitLeadCommand{
		Name:         "Ana Perez",
		Phone:        "+525511111111",
		CRMTag:       "#tags:Japon Premium",
		FormID:       "whatsapp-fab-japon-premium",
		PagePath:     "/japon-premium",
		FormLoadedAt: time.Date(2026, time.June, 18, 20, 44, 0, 0, time.UTC).UnixMilli(),
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if result.RequestID != "req-no-email" {
		t.Fatalf("unexpected request id: %s", result.RequestID)
	}
	if result.MessageID != "lead-1" {
		t.Fatalf("expected lead email message id to be returned, got %q", result.MessageID)
	}
	if mailer.calls != 0 {
		t.Fatalf("expected no confirmation email without recipient, got %d", mailer.calls)
	}
	if leadStore.calls != 1 {
		t.Fatalf("expected lead to be persisted even without email, got %d", leadStore.calls)
	}
}
