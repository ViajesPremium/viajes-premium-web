package application

import (
	"context"
	"strings"
	"testing"
	"time"

	"backend/internal/chat/domain"
	leadmail "backend/internal/leads/application"
)

type botClockStub struct {
	now time.Time
}

func (c botClockStub) Now() time.Time { return c.now }

type botKnowledgeStoreStub struct {
	bots map[string]domain.BotKnowledge
}

func (s botKnowledgeStoreStub) Get(_ context.Context, slug string) (domain.BotKnowledge, error) {
	return s.bots[slug], nil
}

func (s botKnowledgeStoreStub) List(_ context.Context) ([]domain.BotKnowledge, error) {
	items := make([]domain.BotKnowledge, 0, len(s.bots))
	for _, bot := range s.bots {
		items = append(items, bot)
	}
	return items, nil
}

type botConversationRepoStub struct {
	items map[string]*domain.Conversation
}

func (r *botConversationRepoStub) FindByID(_ context.Context, conversationID string) (*domain.Conversation, error) {
	if item, ok := r.items[conversationID]; ok {
		copy := *item
		return &copy, nil
	}
	return nil, nil
}

func (r *botConversationRepoStub) FindBySession(_ context.Context, botSlug, sessionID string) (*domain.Conversation, error) {
	for _, item := range r.items {
		if item.BotSlug == botSlug && item.SessionID == sessionID {
			copy := *item
			return &copy, nil
		}
	}
	return nil, nil
}

func (r *botConversationRepoStub) Create(_ context.Context, conversation *domain.Conversation) error {
	if r.items == nil {
		r.items = map[string]*domain.Conversation{}
	}
	copy := *conversation
	r.items[conversation.ID] = &copy
	return nil
}

func (r *botConversationRepoStub) Update(_ context.Context, conversation *domain.Conversation) error {
	copy := *conversation
	r.items[conversation.ID] = &copy
	return nil
}

type botMessageRepoStub struct {
	items map[string][]domain.Message
}

func (r *botMessageRepoStub) Insert(_ context.Context, message *domain.Message) error {
	if r.items == nil {
		r.items = map[string][]domain.Message{}
	}
	r.items[message.ConversationID] = append(r.items[message.ConversationID], *message)
	return nil
}

func (r *botMessageRepoStub) ListByConversation(_ context.Context, conversationID string) ([]domain.Message, error) {
	items := append([]domain.Message(nil), r.items[conversationID]...)
	return items, nil
}

func (r *botMessageRepoStub) ListRecentByConversation(_ context.Context, conversationID string, limit int) ([]domain.Message, error) {
	items := append([]domain.Message(nil), r.items[conversationID]...)
	if len(items) > limit {
		items = items[len(items)-limit:]
	}
	return items, nil
}

type botLeadRepoStub struct {
	items map[string]*domain.Lead
}

func (r *botLeadRepoStub) FindByConversation(_ context.Context, conversationID string) (*domain.Lead, error) {
	if item, ok := r.items[conversationID]; ok {
		copy := *item
		return &copy, nil
	}
	return nil, nil
}

func (r *botLeadRepoStub) ListPendingBotEmails(_ context.Context, before time.Time, limit int) ([]*domain.Lead, error) {
	items := make([]*domain.Lead, 0)
	for _, item := range r.items {
		if item.BotEmailSentAt.IsZero() && !item.BotEmailDueAt.IsZero() && !item.BotEmailDueAt.After(before) && strings.TrimSpace(item.Name) != "" && strings.TrimSpace(item.Phone) != "" {
			copy := *item
			items = append(items, &copy)
		}
	}
	if len(items) > limit {
		items = items[:limit]
	}
	return items, nil
}

func (r *botLeadRepoStub) Create(_ context.Context, lead *domain.Lead) error {
	if r.items == nil {
		r.items = map[string]*domain.Lead{}
	}
	copy := *lead
	r.items[lead.ConversationID] = &copy
	return nil
}

func (r *botLeadRepoStub) Update(_ context.Context, lead *domain.Lead) error {
	copy := *lead
	r.items[lead.ConversationID] = &copy
	return nil
}

type botLeadEmailSenderStub struct {
	calls int
	last  leadmail.EmailMessage
}

func (s *botLeadEmailSenderStub) SendLeadEmail(_ context.Context, message leadmail.EmailMessage) (string, error) {
	s.calls++
	s.last = message
	return "message-1", nil
}

func TestScheduleBotLeadEmailSetsDueAtWhenContactCaptured(t *testing.T) {
	lead := &domain.Lead{Name: "Ana", Phone: "+525511111111"}
	service := &Service{}
	now := time.Date(2026, time.June, 18, 20, 0, 0, 0, time.UTC)

	service.scheduleBotLeadEmail(lead, now)

	expected := now.Add(botLeadEmailDelay)
	if !lead.BotEmailDueAt.Equal(expected) {
		t.Fatalf("expected due at %v, got %v", expected, lead.BotEmailDueAt)
	}
}

func TestScheduleBotLeadEmailDoesNothingWhenDisabled(t *testing.T) {
	lead := &domain.Lead{Name: "Ana", Phone: "+525511111111"}
	service := &Service{disableLeadEmails: true}
	now := time.Date(2026, time.June, 18, 20, 0, 0, 0, time.UTC)

	service.scheduleBotLeadEmail(lead, now)

	if !lead.BotEmailDueAt.IsZero() {
		t.Fatalf("expected lead email scheduling to stay disabled, got %v", lead.BotEmailDueAt)
	}
}

func TestProcessPendingBotLeadEmailsSendsTranscriptOnce(t *testing.T) {
	now := time.Date(2026, time.June, 18, 20, 0, 0, 0, time.UTC)
	conversation := &domain.Conversation{
		ID:            "conv-1",
		BotSlug:       "japon-premium",
		SessionID:     "session-1",
		LandingURL:    "https://viajespremium.com.mx/japon-premium",
		LandingSlug:   "japon-premium",
		Stage:         domain.StageQualify,
		LastMessageAt: now.Add(-3 * time.Minute),
	}
	lead := &domain.Lead{
		ID:                   "lead-1",
		ConversationID:       conversation.ID,
		BotSlug:              conversation.BotSlug,
		LandingSlug:          conversation.LandingSlug,
		Name:                 "Ana Perez",
		Phone:                "+525511111111",
		Interest:             "Japon Pop",
		Travelers:            "2 personas",
		TravelDate:           "2026-12-01",
		SpecialOccasion:      "Aniversario",
		PreferredContactTime: "por la tarde",
		Stage:                domain.StageQualify,
		Score:                40,
		BotEmailDueAt:        now.Add(-1 * time.Minute),
	}
	service := &Service{
		knowledge: botKnowledgeStoreStub{bots: map[string]domain.BotKnowledge{
			"japon-premium": domain.BotKnowledge{Slug: "japon-premium", DisplayName: "Japon PREMIUM"},
		}},
		conversations: &botConversationRepoStub{items: map[string]*domain.Conversation{conversation.ID: conversation}},
		messages: &botMessageRepoStub{items: map[string][]domain.Message{
			conversation.ID: {
				{ID: "msg-1", ConversationID: conversation.ID, Role: domain.RoleUser, Content: "Hola", CreatedAt: now.Add(-4 * time.Minute)},
				{ID: "msg-2", ConversationID: conversation.ID, Role: domain.RoleAssistant, Content: "Con gusto le ayudo", CreatedAt: now.Add(-3 * time.Minute)},
				{ID: "msg-3", ConversationID: conversation.ID, Role: domain.RoleUser, Content: "Mi nombre es Ana", CreatedAt: now.Add(-2 * time.Minute)},
			},
		}},
		leads:           &botLeadRepoStub{items: map[string]*domain.Lead{conversation.ID: lead}},
		leadEmailSender: &botLeadEmailSenderStub{},
		clock:           botClockStub{now: now},
	}

	processed, err := service.ProcessPendingBotLeadEmails(context.Background(), 10)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if processed != 1 {
		t.Fatalf("expected 1 processed lead, got %d", processed)
	}

	sender := service.leadEmailSender.(*botLeadEmailSenderStub)
	if sender.calls != 1 {
		t.Fatalf("expected one email send, got %d", sender.calls)
	}
	if !strings.Contains(sender.last.TextBody, "Mi nombre es Ana") {
		t.Fatalf("expected transcript in email body, got %q", sender.last.TextBody)
	}
	if !strings.Contains(sender.last.TextBody, "bot: Con gusto le ayudo") {
		t.Fatalf("expected bot transcript line in email body, got %q", sender.last.TextBody)
	}
	if !strings.Contains(sender.last.TextBody, "cliente: Mi nombre es Ana") {
		t.Fatalf("expected client transcript line in email body, got %q", sender.last.TextBody)
	}
	if sender.last.Subject != "Cotización LP Japón PREMIUM ® Bot con IA" {
		t.Fatalf("expected bot email subject to be normalized, got %q", sender.last.Subject)
	}
	if strings.Contains(sender.last.TextBody, "[") {
		t.Fatalf("expected transcript without timestamps, got %q", sender.last.TextBody)
	}

	stored := service.leads.(*botLeadRepoStub).items[conversation.ID]
	if stored.BotEmailSentAt.IsZero() {
		t.Fatalf("expected bot email sent timestamp to be stored")
	}
	if stored.BotEmailMessageID != "message-1" {
		t.Fatalf("expected bot email message id to be stored, got %q", stored.BotEmailMessageID)
	}

	processed, err = service.ProcessPendingBotLeadEmails(context.Background(), 10)
	if err != nil {
		t.Fatalf("unexpected error on second pass: %v", err)
	}
	if processed != 0 {
		t.Fatalf("expected no extra emails on second pass, got %d", processed)
	}
	if sender.calls != 1 {
		t.Fatalf("expected email to be sent once, got %d", sender.calls)
	}
}

func TestBuildBotLeadEmailMessageIncludesAttribution(t *testing.T) {
	bot := domain.BotKnowledge{DisplayName: "Japon PREMIUM"}
	conversation := &domain.Conversation{
		LandingURL:  "https://viajespremium.com.mx/japon-premium?utm_source=google",
		LandingSlug: "japon-premium",
	}
	lead := &domain.Lead{
		Name:  "Ana Perez",
		Phone: "+525511111111",
		Attribution: domain.Attribution{
			UTMSource:   "google",
			UTMMedium:   "cpc",
			UTMCampaign: "japon-premium",
			LandingSlug: "japon-premium",
			PagePath:    "/japon-premium",
		},
	}

	message := buildBotLeadEmailMessage(bot, conversation, lead, nil, time.Date(2026, time.June, 18, 20, 0, 0, 0, time.UTC))

	if !strings.Contains(message.TextBody, "Atribución:") {
		t.Fatalf("expected attribution section in bot email body, got %q", message.TextBody)
	}
	if !strings.Contains(message.TextBody, "UTM Source: google") {
		t.Fatalf("expected UTM source in bot email body, got %q", message.TextBody)
	}
	if !strings.Contains(message.HTMLBody, "Atribución") {
		t.Fatalf("expected attribution section in bot email HTML, got %q", message.HTMLBody)
	}
}

func TestOrderedTranscriptMessagesKeepsClientBeforeBotOnEqualTimestamps(t *testing.T) {
	now := time.Date(2026, time.June, 18, 20, 0, 0, 0, time.UTC)
	messages := []domain.Message{
		{ID: "msg-2", Role: domain.RoleAssistant, Content: "Con gusto le ayudo", CreatedAt: now},
		{ID: "msg-1", Role: domain.RoleUser, Content: "Hola", CreatedAt: now},
	}

	ordered := orderedTranscriptMessages(messages)
	if len(ordered) != 2 {
		t.Fatalf("expected 2 ordered messages, got %d", len(ordered))
	}
	if ordered[0].Role != domain.RoleUser || ordered[1].Role != domain.RoleAssistant {
		t.Fatalf("expected user before assistant on equal timestamps, got %#v", ordered)
	}

	transcript := buildBotTranscriptText(ordered, now)
	if !strings.Contains(transcript, "cliente: Hola") || !strings.Contains(transcript, "bot: Con gusto le ayudo") {
		t.Fatalf("expected transcript to preserve client-first order, got %q", transcript)
	}
	if strings.Index(transcript, "cliente: Hola") > strings.Index(transcript, "bot: Con gusto le ayudo") {
		t.Fatalf("expected client line before bot line, got %q", transcript)
	}
}

func TestProcessPendingBotLeadEmailsSkipsWhenDisabled(t *testing.T) {
	now := time.Date(2026, time.June, 18, 20, 0, 0, 0, time.UTC)
	service := &Service{
		disableLeadEmails: true,
		leadEmailSender:   &botLeadEmailSenderStub{},
		leads: &botLeadRepoStub{items: map[string]*domain.Lead{
			"lead-1": {
				ID:             "lead-1",
				ConversationID: "conv-1",
				Name:           "Ana Perez",
				Phone:          "+525511111111",
				BotEmailDueAt:  now.Add(-1 * time.Minute),
			},
		}},
		clock: botClockStub{now: now},
	}

	processed, err := service.ProcessPendingBotLeadEmails(context.Background(), 10)
	if err != nil {
		t.Fatalf("unexpected error when disabled: %v", err)
	}
	if processed != 0 {
		t.Fatalf("expected disabled email flow to process nothing, got %d", processed)
	}
	if sender := service.leadEmailSender.(*botLeadEmailSenderStub); sender.calls != 0 {
		t.Fatalf("expected no email sends when disabled, got %d", sender.calls)
	}
}
