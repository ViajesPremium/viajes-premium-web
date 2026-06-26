package application

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"strings"
	"time"

	"backend/internal/leads/application/dto"
)

type SubmitLeadService struct {
	mailer             Mailer
	confirmationMailer ConfirmationMailer
	leadStore          LeadStore
	now                func() time.Time
	newID              func() string
}

func NewSubmitLeadService(mailer Mailer, leadStore ...LeadStore) *SubmitLeadService {
	service := &SubmitLeadService{
		mailer: mailer,
		now:    time.Now,
		newID:  newRequestID,
	}
	if len(leadStore) > 0 {
		service.leadStore = leadStore[0]
	}
	if confirmationMailer, ok := mailer.(ConfirmationMailer); ok {
		service.confirmationMailer = confirmationMailer
	}
	return service
}

func (s *SubmitLeadService) Execute(ctx context.Context, command dto.SubmitLeadCommand) (dto.SubmitLeadResult, error) {
	requestID := s.newID()

	if strings.TrimSpace(command.Honeypot) != "" {
		return dto.SubmitLeadResult{RequestID: requestID}, ErrInvalidRequest
	}

	if command.FormLoadedAt <= 0 || s.now().UnixMilli()-command.FormLoadedAt < 3000 {
		return dto.SubmitLeadResult{RequestID: requestID}, ErrInvalidRequest
	}

	lead := mapCommandToLead(command)
	if lead.Name == "" || lead.Phone == "" {
		return dto.SubmitLeadResult{RequestID: requestID}, ErrMissingRequired
	}
	now := s.now()
	lead.ID = requestID
	lead.ConversationID = requestID
	lead.BotSlug = getLandingIDFromPath(lead.PagePath)
	lead.LandingSlug = getLandingIDFromPath(firstNonEmpty(lead.Attribution.LandingSlug, lead.PagePath))
	lead.Stage = "new"
	lead.Score = 0
	lead.Priority = DerivePriorityFromTravelDate(lead.TravelDate, now)
	lead.CreatedAt = now
	lead.UpdatedAt = now

	if s.leadStore != nil {
		if err := s.leadStore.SaveLead(ctx, &lead); err != nil {
			return dto.SubmitLeadResult{RequestID: requestID}, err
		}
	}

	envelope := buildLeadEnvelope(requestID, lead, now)
	messageID, err := s.mailer.SendLeadEmail(ctx, buildLeadEmailMessage(envelope))
	if err != nil {
		return dto.SubmitLeadResult{RequestID: requestID}, err
	}
	if s.confirmationMailer != nil && strings.TrimSpace(lead.Email) != "" {
		_, _ = s.confirmationMailer.SendConfirmationEmail(ctx, buildConfirmationEmailMessage(envelope))
	}

	return dto.SubmitLeadResult{
		RequestID: requestID,
		MessageID: messageID,
	}, nil
}

func newRequestID() string {
	buf := make([]byte, 16)
	if _, err := rand.Read(buf); err != nil {
		return fmt.Sprintf("req-%d", time.Now().UnixNano())
	}
	return hex.EncodeToString(buf)
}
