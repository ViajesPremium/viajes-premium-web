package application

import "context"

import "backend/internal/leads/domain"

type Mailer interface {
	SendLeadEmail(ctx context.Context, message EmailMessage) (string, error)
}

type ConfirmationMailer interface {
	SendConfirmationEmail(ctx context.Context, message EmailMessage) (string, error)
}

type LeadStore interface {
	SaveLead(ctx context.Context, lead *domain.Lead) error
}

type EmailMessage struct {
	To       string
	ReplyTo  string
	Subject  string
	TextBody string
	HTMLBody string
}
