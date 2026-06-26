package application

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/url"
	"strings"
	"time"
	"unicode/utf8"

	"backend/internal/chat/domain"
	leadmail "backend/internal/leads/application"
)

var ErrMessageEmpty = errors.New("message is empty")
var ErrLLMRequired = errors.New("llm required")

type Service struct {
	knowledge         KnowledgeStore
	conversations     ConversationRepository
	messages          MessageRepository
	leads             LeadRepository
	leadEvents        LeadEventRepository
	leadEmailSender   LeadEmailSender
	llm               LLMClient
	clock             Clock
	defaultBotSlug    string
	handoffThreshold  int
	disableLeadEmails bool
}

type Deps struct {
	Knowledge         KnowledgeStore
	ConversationRepo  ConversationRepository
	MessageRepo       MessageRepository
	LeadRepo          LeadRepository
	LeadEventRepo     LeadEventRepository
	LeadEmailSender   LeadEmailSender
	LLM               LLMClient
	DefaultBotSlug    string
	HandoffThreshold  int
	LeadEmailsEnabled bool
}

func NewService(deps Deps) *Service {
	return &Service{
		knowledge:         deps.Knowledge,
		conversations:     deps.ConversationRepo,
		messages:          deps.MessageRepo,
		leads:             deps.LeadRepo,
		leadEmailSender:   deps.LeadEmailSender,
		leadEvents:        deps.LeadEventRepo,
		llm:               deps.LLM,
		clock:             systemClock{},
		defaultBotSlug:    firstNonEmpty(deps.DefaultBotSlug, "home"),
		handoffThreshold:  clampInt(deps.HandoffThreshold, 1, 100, 70),
		disableLeadEmails: !deps.LeadEmailsEnabled,
	}
}

func (s *Service) nowUTC() time.Time {
	if s != nil && s.clock != nil {
		return s.clock.Now().UTC()
	}
	return time.Now().UTC()
}
func (s *Service) HandleMessage(ctx context.Context, req MessageRequest) (MessageResponse, error) {
	if strings.TrimSpace(req.Message) == "" {
		return MessageResponse{OK: false}, ErrMessageEmpty
	}

	botSlug := ResolveBotSlug(firstNonEmpty(req.BotSlug, s.defaultBotSlug), req.LandingURL, s.defaultBotSlug)
	bot, err := s.knowledge.Get(ctx, botSlug)
	if err != nil {
		return MessageResponse{OK: false}, err
	}

	now := s.nowUTC()
	conversation, err := s.getOrCreateConversation(ctx, req, botSlug, now)
	if err != nil {
		return MessageResponse{OK: false}, err
	}

	userMessage := &domain.Message{
		ID:             newID("msg"),
		ConversationID: conversation.ID,
		Role:           domain.RoleUser,
		Content:        strings.TrimSpace(req.Message),
		Source:         "frontend",
		Metadata: map[string]any{
			"bot_slug":    botSlug,
			"landing_url": req.LandingURL,
			"attribution": attributionMetadata(req.Attribution),
		},
		CreatedAt: now,
	}
	if err := s.messages.Insert(ctx, userMessage); err != nil {
		return MessageResponse{OK: false}, err
	}

	lead, err := s.getOrCreateLead(ctx, conversation, botSlug, now)
	if err != nil {
		return MessageResponse{OK: false}, err
	}
	if hasAttributionData(req.Attribution) {
		lead.Attribution = mergeAttribution(lead.Attribution, req.Attribution)
	}

	updatedLead, signal := s.extractLeadSignals(ctx, bot, lead, req.Message, conversation, now)
	s.scheduleBotLeadEmail(updatedLead, now)
	score := s.computeScore(bot, updatedLead, conversation, req.Message)
	stage := s.computeStage(score, updatedLead, signal)
	handoff := s.shouldHandoff(bot, score, stage, signal, updatedLead)

	updatedLead.Score = score
	updatedLead.Stage = stage
	updatedLead.HandoffRequired = handoff.Required
	updatedLead.HandoffReason = handoff.Reason
	if err := s.saveLead(ctx, updatedLead, signal); err != nil {
		return MessageResponse{OK: false}, err
	}

	conversation.Stage = stage
	conversation.Score = score
	conversation.LeadID = updatedLead.ID
	conversation.UpdatedAt = now
	conversation.LastMessageAt = now
	conversation.Summary = buildConversationSummary(updatedLead, conversation, req.Message, signal)
	if conversation.Metadata == nil {
		conversation.Metadata = map[string]any{}
	}
	conversation.Metadata["bot_slug"] = botSlug
	conversation.Metadata["handoff"] = handoff.Required
	if hasAttributionData(req.Attribution) {
		conversation.Metadata["attribution"] = attributionMetadata(req.Attribution)
	}
	if signal.Details != nil {
		if declined, ok := signal.Details["phone_refused"].(bool); ok && declined {
			conversation.Metadata["phone_refused"] = true
		}
		if declined, ok := signal.Details["email_refused"].(bool); ok && declined {
			conversation.Metadata["email_refused"] = true
		}
		if declined, ok := signal.Details["followup_declined"].(bool); ok && declined {
			conversation.Metadata["followup_declined"] = true
		}
	}
	if err := s.conversations.Update(ctx, conversation); err != nil {
		return MessageResponse{OK: false}, err
	}

	recentMessages, err := s.messages.ListRecentByConversation(ctx, conversation.ID, 8)
	if err != nil {
		return MessageResponse{OK: false}, err
	}

	responseText, source, err := s.generateResponse(ctx, bot, conversation, updatedLead, recentMessages, req.Message, handoff)
	if err != nil {
		return MessageResponse{OK: false}, err
	}
	assistantMessage := &domain.Message{
		ID:             newID("msg"),
		ConversationID: conversation.ID,
		Role:           domain.RoleAssistant,
		Content:        responseText,
		Source:         source,
		Metadata: map[string]any{
			"score":           score,
			"stage":           stage,
			"handoff":         handoff.Required,
			"handoff_reason":  handoff.Reason,
			"bot_slug":        botSlug,
			"conversation_id": conversation.ID,
		},
		CreatedAt: now,
	}
	if err := s.messages.Insert(ctx, assistantMessage); err != nil {
		return MessageResponse{OK: false}, err
	}

	response := MessageResponse{
		OK:             true,
		BotSlug:        botSlug,
		SessionID:      conversation.SessionID,
		ConversationID: conversation.ID,
		Stage:          stage,
		Score:          score,
		Lead:           buildLeadSnapshot(updatedLead),
		Handoff:        HandoffSnapshot{Required: handoff.Required, Reason: handoff.Reason},
		Response:       BotResponseSnapshot{Text: responseText, Source: source},
		Knowledge:      KnowledgeSnapshot{Slug: bot.Slug, BrandName: bot.BrandName, DisplayName: bot.DisplayName},
	}

	return response, nil
}

func (s *Service) getOrCreateConversation(ctx context.Context, req MessageRequest, botSlug string, now time.Time) (*domain.Conversation, error) {
	sessionID := strings.TrimSpace(req.SessionID)
	if sessionID == "" {
		sessionID = newID("session")
	}

	existing, err := s.conversations.FindBySession(ctx, botSlug, sessionID)
	if err != nil {
		return nil, err
	}
	if existing != nil {
		return existing, nil
	}

	conv := &domain.Conversation{
		ID:            newID("conv"),
		BotSlug:       botSlug,
		SessionID:     sessionID,
		LandingURL:    strings.TrimSpace(req.LandingURL),
		LandingSlug:   landingSlugFromURL(req.LandingURL),
		Stage:         domain.StageNew,
		Score:         0,
		Summary:       "",
		Metadata:      map[string]any{"bot_slug": botSlug},
		LastMessageAt: now,
		CreatedAt:     now,
		UpdatedAt:     now,
	}
	if err := s.conversations.Create(ctx, conv); err != nil {
		return nil, err
	}
	return conv, nil
}

func (s *Service) getOrCreateLead(ctx context.Context, conversation *domain.Conversation, botSlug string, now time.Time) (*domain.Lead, error) {
	lead, err := s.leads.FindByConversation(ctx, conversation.ID)
	if err != nil {
		return nil, err
	}
	if lead != nil {
		return lead, nil
	}

	lead = &domain.Lead{
		ID:              newID("lead"),
		ConversationID:  conversation.ID,
		BotSlug:         botSlug,
		LandingSlug:     conversation.LandingSlug,
		Stage:           domain.StageNew,
		Score:           0,
		Priority:        "normal",
		HandoffRequired: false,
		CreatedAt:       now,
		UpdatedAt:       now,
	}
	if err := s.leads.Create(ctx, lead); err != nil {
		return nil, err
	}
	return lead, nil
}

func (s *Service) saveLead(ctx context.Context, lead *domain.Lead, signal LeadSignal) error {
	if err := s.leads.Update(ctx, lead); err != nil {
		return err
	}

	if signal.EventType != "" {
		event := &domain.LeadEvent{
			ID:        newID("evt"),
			LeadID:    lead.ID,
			EventType: signal.EventType,
			Details:   signal.Details,
			CreatedAt: s.nowUTC(),
		}
		if err := s.leadEvents.Insert(ctx, event); err != nil {
			return err
		}
	}

	return nil
}

func (s *Service) generateResponse(ctx context.Context, bot domain.BotKnowledge, conversation *domain.Conversation, lead *domain.Lead, messages []domain.Message, userMessage string, handoff HandoffDecision) (string, string, error) {
	now := s.nowUTC()

	if s.llm == nil || !s.llm.Enabled() {
		return s.generateFallbackResponse(bot, conversation, lead, userMessage, handoff, now), "rules_fallback", nil
	}

	ruleGuide := BuildResponseGuide(bot, conversation, lead, userMessage, now, handoff)
	prompt := BuildPrompt(bot, conversation, lead, messages, userMessage, ruleGuide, s.handoffThreshold, now)
	result, err := s.llm.Generate(ctx, prompt)
	if err != nil {
		return s.generateFallbackResponse(bot, conversation, lead, userMessage, handoff, now), "rules_fallback", nil
	}

	text := strings.TrimSpace(result.Text)
	if text == "" {
		return s.generateFallbackResponse(bot, conversation, lead, userMessage, handoff, now), "rules_fallback", nil
	}

	repaired := repairIncompleteResponse(text, bot, conversation, lead, userMessage, handoff, now)
	if repaired != text {
		return ensureResponseAdvancesFlow(repaired, bot, lead, conversation, userMessage), "llm_repaired", nil
	}

	finalText := ensureResponseAdvancesFlow(
		reinforceResponseContinuity(text, lead, bot),
		bot,
		lead,
		conversation,
		userMessage,
	)
	return finalText, firstNonEmpty(result.Source, "llm"), nil
}

func (s *Service) generateFallbackResponse(bot domain.BotKnowledge, conversation *domain.Conversation, lead *domain.Lead, userMessage string, handoff HandoffDecision, now time.Time) string {
	return reinforceResponseContinuity(
		BuildRuleResponse(bot, conversation, lead, userMessage, now, handoff),
		lead,
		bot,
	)
}

func repairIncompleteResponse(text string, bot domain.BotKnowledge, conversation *domain.Conversation, lead *domain.Lead, userMessage string, handoff HandoffDecision, now time.Time) string {
	clean := strings.TrimSpace(text)
	if clean == "" {
		return clean
	}
	if !looksIncomplete(clean) {
		return reinforceResponseContinuity(clean, lead, bot)
	}

	return srepairFallback(bot, conversation, lead, userMessage, handoff, now)
}

func srepairFallback(bot domain.BotKnowledge, conversation *domain.Conversation, lead *domain.Lead, userMessage string, handoff HandoffDecision, now time.Time) string {
	return reinforceResponseContinuity(
		BuildRuleResponse(bot, conversation, lead, userMessage, now, handoff),
		lead,
		bot,
	)
}

func looksIncomplete(text string) bool {
	trimmed := strings.TrimSpace(text)
	if trimmed == "" {
		return false
	}

	lastRune, _ := utf8.DecodeLastRuneInString(trimmed)
	switch lastRune {
	case '.', '!', '?', '"', '\'':
		return false
	}

	lower := strings.ToLower(trimmed)
	tokens := strings.Fields(lower)
	if len(tokens) == 0 {
		return true
	}

	last := strings.Trim(tokens[len(tokens)-1], ".,;:!?()[]{}\"'")
	if len(last) <= 3 {
		return true
	}

	switch last {
	case "y", "de", "la", "el", "un", "una", "para", "con", "por", "al", "o", "e", "en", "del", "los", "las", "su", "sus":
		return true
	}

	fragilePrefixes := []string{
		"permiteme",
		"permitame",
		"con gusto,",
		"para comenzar",
		"para seguir",
		"me podria",
		"podria indicarme",
	}
	for _, prefix := range fragilePrefixes {
		if strings.Contains(lower, prefix) && !strings.Contains(lower, "?") {
			return true
		}
	}

	return false
}

func (s *Service) extractLeadSignals(ctx context.Context, bot domain.BotKnowledge, lead *domain.Lead, message string, conversation *domain.Conversation, now time.Time) (*domain.Lead, LeadSignal) {
	updated := *lead
	normalized := strings.ToLower(strings.TrimSpace(message))
	signal := LeadSignal{Details: map[string]any{}}

	if updated.Name == "" {
		if value := detectName(message); value != "" {
			updated.Name = value
			signal.EventType = "lead_name_captured"
			signal.Details["name"] = value
		}
	}
	if updated.Email == "" {
		if value := detectEmail(message); value != "" {
			updated.Email = value
			signal.EventType = firstNonEmpty(signal.EventType, "lead_email_captured")
			signal.Details["email"] = value
		}
	}
	if updated.Phone == "" {
		if value := detectPhone(message); value != "" {
			updated.Phone = value
			signal.EventType = firstNonEmpty(signal.EventType, "lead_phone_captured")
			signal.Details["phone"] = value
		}
	}
	if nextInterest := detectInterest(bot, normalized); shouldReplaceInterest(updated.Interest, nextInterest, bot) {
		updated.Interest = nextInterest
		signal.EventType = firstNonEmpty(signal.EventType, "lead_interest_captured")
		signal.Details["interest"] = nextInterest
	}
	if value := detectTravelers(message); value != "" && value != updated.Travelers {
		updated.Travelers = value
		signal.EventType = firstNonEmpty(signal.EventType, "lead_travelers_captured")
		signal.Details["travelers"] = value
	}
	if value, precision := detectTravelDateWithPrecision(message, now); value != "" && shouldUpdateTravelDate(updated.TravelDate, value, precision, now) {
		updated.TravelDate = value
		signal.EventType = firstNonEmpty(signal.EventType, "lead_travel_date_captured")
		signal.Details["travel_date"] = value
	}
	if value := detectSpecialOccasion(message); value != "" && value != updated.SpecialOccasion {
		updated.SpecialOccasion = value
		signal.EventType = firstNonEmpty(signal.EventType, "lead_special_occasion_captured")
		signal.Details["special_occasion"] = value
	}
	if value := detectPreferredContactTime(message); value != "" && value != updated.PreferredContactTime {
		updated.PreferredContactTime = value
		signal.EventType = firstNonEmpty(signal.EventType, "lead_preferred_contact_time_captured")
		signal.Details["preferred_contact_time"] = value
	}

	if s.shouldUseAILeadExtraction(bot, message, &updated, now) {
		if aiUpdates, ok := s.extractLeadSignalsWithAI(ctx, bot, &updated, message, now); ok {
			s.applyLeadExtractionUpdates(bot, &updated, aiUpdates, &signal, now)
		}
	}

	priority := leadmail.DerivePriorityFromTravelDate(updated.TravelDate, now)
	if updated.Priority != priority {
		updated.Priority = priority
		signal.EventType = firstNonEmpty(signal.EventType, "lead_priority_updated")
		signal.Details["priority"] = priority
	}

	if strings.Contains(normalized, "cotiz") || strings.Contains(normalized, "precio") || strings.Contains(normalized, "costo") {
		signal.EventType = firstNonEmpty(signal.EventType, "pricing_intent_detected")
		signal.Details["pricing_intent"] = true
	}
	if handoffIntentDetected(bot, normalized) {
		signal.EventType = "handoff_intent_detected"
		signal.Details["handoff_intent"] = true
	}
	if emailDeclinedIntent(normalized) {
		signal.EventType = firstNonEmpty(signal.EventType, "email_refused")
		signal.Details["email_refused"] = true
	}
	if followupOptOutIntent(normalized) {
		signal.EventType = firstNonEmpty(signal.EventType, "followup_declined")
		signal.Details["followup_declined"] = true
	}
	if containsAny(normalized, []string{"no quiero", "prefiero no", "no deseo", "no me gusta"}) && containsAny(normalized, []string{"telefono", "whatsapp", "llamar", "llamadas", "marcar", "marquen", "llame", "llamen", "contacto"}) {
		signal.EventType = firstNonEmpty(signal.EventType, "contact_phone_declined")
		signal.Details["phone_refused"] = true
	}
	if signal.Details == nil {
		signal.Details = map[string]any{}
	}
	if conversation != nil && conversation.Stage == domain.StageNew && (updated.Name != "" || updated.Email != "" || updated.Phone != "") {
		signal.EventType = firstNonEmpty(signal.EventType, "qualification_started")
	}
	return &updated, signal
}

type leadExtractionAIResult struct {
	Updates map[string]json.RawMessage `json:"updates"`
}

func detectTravelDateWithPrecision(message string, now time.Time) (string, leadmail.TravelDatePrecision) {
	cleaned := strings.TrimSpace(message)
	if cleaned == "" || looksLikePhoneAttempt(cleaned) {
		return "", leadmail.TravelDatePrecisionUnknown
	}

	candidate := detectTravelDate(cleaned, now)
	if candidate == "" {
		return "", leadmail.TravelDatePrecisionUnknown
	}

	parsed, precision, ok := leadmail.ParseTravelDateDetails(candidate, now)
	if !ok {
		return "", leadmail.TravelDatePrecisionUnknown
	}

	return parsed.Format("2006-01-02"), precision
}

func shouldUpdateTravelDate(currentValue, candidateValue string, candidatePrecision leadmail.TravelDatePrecision, now time.Time) bool {
	candidateValue = strings.TrimSpace(candidateValue)
	if candidateValue == "" {
		return false
	}

	currentValue = strings.TrimSpace(currentValue)
	if currentValue == "" {
		return true
	}

	currentParsed, ok := leadmail.ParseTravelDate(currentValue, now)
	if !ok {
		return true
	}

	currentPrecision := currentTravelDatePrecision(currentParsed)
	if candidatePrecision > currentPrecision {
		return true
	}
	if candidatePrecision < currentPrecision {
		return false
	}

	return candidateValue != currentParsed.Format("2006-01-02")
}

func currentTravelDatePrecision(value time.Time) leadmail.TravelDatePrecision {
	if value.IsZero() {
		return leadmail.TravelDatePrecisionUnknown
	}
	if value.Day() == 1 {
		return leadmail.TravelDatePrecisionMonth
	}
	return leadmail.TravelDatePrecisionDay
}

func (s *Service) shouldUseAILeadExtraction(bot domain.BotKnowledge, message string, lead *domain.Lead, now time.Time) bool {
	if s == nil || s.llm == nil || !s.llm.Enabled() {
		return false
	}

	cleaned := strings.TrimSpace(message)
	if cleaned == "" {
		return false
	}

	normalized := normalizeText(cleaned)
	primarySignals := 0
	secondarySignals := 0

	if detectName(cleaned) != "" {
		secondarySignals++
	}
	if detectEmail(cleaned) != "" {
		secondarySignals++
	}
	if detectPhone(cleaned) != "" {
		secondarySignals++
	}
	if interest := detectInterest(bot, normalized); interest != "" {
		primarySignals++
	}
	if detectTravelers(cleaned) != "" {
		primarySignals++
	}
	if detectTravelDate(cleaned, now) != "" {
		primarySignals++
	}
	if detectSpecialOccasion(cleaned) != "" {
		primarySignals++
	}
	if detectPreferredContactTime(cleaned) != "" {
		primarySignals++
	}

	durationMentioned := containsAny(normalized, []string{"dias", "dia", "noches", "semanas"})
	complexMarkers := containsAny(normalized, []string{"ademas", "tambien", "pero", "aunque", ",", ";", ":"})

	if durationMentioned && containsAny(normalized, []string{"vacaciones", "disponibilidad", "solamente", "solo tengo", "dispongo de"}) {
		primarySignals++
	}
	if detectTravelDate(cleaned, now) != "" && durationMentioned {
		primarySignals++
	}
	if detectTravelDate(cleaned, now) != "" && detectPreferredContactTime(cleaned) != "" {
		primarySignals++
	}
	if detectName(cleaned) != "" && (detectTravelDate(cleaned, now) != "" || detectTravelers(cleaned) != "" || detectSpecialOccasion(cleaned) != "" || detectPreferredContactTime(cleaned) != "") {
		primarySignals++
	}
	if detectInterest(bot, normalized) != "" && (detectTravelDate(cleaned, now) != "" || detectTravelers(cleaned) != "" || detectPreferredContactTime(cleaned) != "") {
		primarySignals++
	}

	if primarySignals >= 2 {
		return true
	}
	if primarySignals >= 1 && secondarySignals >= 1 && complexMarkers {
		return true
	}

	return false
}

func (s *Service) extractLeadSignalsWithAI(ctx context.Context, bot domain.BotKnowledge, lead *domain.Lead, message string, now time.Time) (leadExtractionAIResult, bool) {
	if s == nil || s.llm == nil || !s.llm.Enabled() {
		return leadExtractionAIResult{}, false
	}

	prompt := BuildLeadExtractionPrompt(bot, lead, message)
	result, err := s.llm.Generate(ctx, prompt)
	if err != nil {
		return leadExtractionAIResult{}, false
	}

	parsed, err := parseLeadExtractionAIResult(result.Text)
	if err != nil {
		return leadExtractionAIResult{}, false
	}

	return parsed, true
}

func parseLeadExtractionAIResult(text string) (leadExtractionAIResult, error) {
	candidate := strings.TrimSpace(text)
	if candidate == "" {
		return leadExtractionAIResult{}, fmt.Errorf("empty extraction response")
	}

	candidate = strings.TrimPrefix(candidate, "```json")
	candidate = strings.TrimPrefix(candidate, "```")
	candidate = strings.TrimSuffix(candidate, "```")
	candidate = strings.TrimSpace(candidate)

	if !strings.HasPrefix(candidate, "{") || !strings.HasSuffix(candidate, "}") {
		start := strings.Index(candidate, "{")
		end := strings.LastIndex(candidate, "}")
		if start < 0 || end <= start {
			return leadExtractionAIResult{}, fmt.Errorf("missing json object")
		}
		candidate = candidate[start : end+1]
	}

	var result leadExtractionAIResult
	if err := json.Unmarshal([]byte(candidate), &result); err != nil {
		return leadExtractionAIResult{}, err
	}
	return result, nil
}

func (s *Service) applyLeadExtractionUpdates(bot domain.BotKnowledge, lead *domain.Lead, ai leadExtractionAIResult, signal *LeadSignal, now time.Time) {
	if lead == nil || signal == nil {
		return
	}
	if signal.Details == nil {
		signal.Details = map[string]any{}
	}

	ordered := []string{"name", "email", "phone", "interest", "travelers", "travel_date", "special_occasion", "preferred_contact_time"}
	existing := make(map[string]string, len(ai.Updates))
	for field, raw := range ai.Updates {
		existing[field] = jsonRawMessageToString(raw)
	}

	for _, field := range ordered {
		value := strings.TrimSpace(existing[field])
		if value == "" {
			continue
		}

		switch field {
		case "name":
			if lead.Name != "" {
				continue
			}
			if detected := detectName(value); detected != "" {
				lead.Name = detected
				recordLeadExtractionSignal(signal, "lead_name_captured", "name", detected)
			}
		case "email":
			if lead.Email != "" {
				continue
			}
			if detected := detectEmail(value); detected != "" {
				lead.Email = detected
				recordLeadExtractionSignal(signal, "lead_email_captured", "email", detected)
			}
		case "phone":
			if lead.Phone != "" {
				continue
			}
			if detected := detectPhone(value); detected != "" {
				lead.Phone = detected
				recordLeadExtractionSignal(signal, "lead_phone_captured", "phone", detected)
			}
		case "interest":
			nextInterest := detectInterest(bot, normalizeText(value))
			if shouldReplaceInterest(lead.Interest, nextInterest, bot) {
				lead.Interest = nextInterest
				recordLeadExtractionSignal(signal, "lead_interest_captured", "interest", nextInterest)
			}
		case "travelers":
			if lead.Travelers != "" {
				continue
			}
			if detected := detectTravelers(value); detected != "" {
				lead.Travelers = detected
				recordLeadExtractionSignal(signal, "lead_travelers_captured", "travelers", detected)
			}
		case "travel_date":
			if detected, precision, ok := leadmail.ParseTravelDateDetails(value, now); ok && shouldUpdateTravelDate(lead.TravelDate, detected.Format("2006-01-02"), precision, now) {
				formatted := detected.Format("2006-01-02")
				lead.TravelDate = formatted
				recordLeadExtractionSignal(signal, "lead_travel_date_captured", "travel_date", formatted)
			}
		case "special_occasion":
			if lead.SpecialOccasion != "" {
				continue
			}
			if detected := detectSpecialOccasion(value); detected != "" {
				lead.SpecialOccasion = detected
				recordLeadExtractionSignal(signal, "lead_special_occasion_captured", "special_occasion", detected)
			}
		case "preferred_contact_time":
			if lead.PreferredContactTime != "" {
				continue
			}
			if detected := detectPreferredContactTime(value); detected != "" {
				lead.PreferredContactTime = detected
				recordLeadExtractionSignal(signal, "lead_preferred_contact_time_captured", "preferred_contact_time", detected)
			}
		}
	}
}

func recordLeadExtractionSignal(signal *LeadSignal, eventType, field, value string) {
	if signal == nil || strings.TrimSpace(value) == "" {
		return
	}
	if signal.Details == nil {
		signal.Details = map[string]any{}
	}
	if signal.EventType == "" {
		signal.EventType = eventType
	}
	signal.Details[field] = value
}

func jsonRawMessageToString(raw json.RawMessage) string {
	if len(raw) == 0 || string(raw) == "null" {
		return ""
	}

	var value any
	if err := json.Unmarshal(raw, &value); err != nil {
		return strings.TrimSpace(string(raw))
	}

	switch v := value.(type) {
	case string:
		return strings.TrimSpace(v)
	case float64:
		return strings.TrimSpace(strings.TrimRight(strings.TrimRight(fmt.Sprintf("%f", v), "0"), "."))
	case bool:
		if v {
			return "true"
		}
		return "false"
	default:
		return strings.TrimSpace(fmt.Sprint(v))
	}
}

func (s *Service) computeScore(bot domain.BotKnowledge, lead *domain.Lead, conversation *domain.Conversation, message string) int {
	score := 0
	if strings.TrimSpace(lead.Name) != "" {
		score += 10
	}
	if strings.TrimSpace(lead.Phone) != "" {
		score += 15
	}
	if strings.TrimSpace(lead.Interest) != "" {
		score += 10
	}
	if strings.TrimSpace(lead.Travelers) != "" {
		score += 15
	}
	if strings.TrimSpace(lead.TravelDate) != "" {
		score += 15
	}
	if strings.TrimSpace(lead.SpecialOccasion) != "" {
		score += 10
	}
	if strings.TrimSpace(lead.PreferredContactTime) != "" {
		score += 5
	}
	normalized := strings.ToLower(strings.TrimSpace(message))
	if containsAny(normalized, bot.ItineraryKeywords()) {
		score += 10
	}
	if containsAny(normalized, []string{"precio", "cotizacion", "disponibilidad", "fechas", "fecha", "reservar"}) {
		score += 10
	}
	if score > 100 {
		return 100
	}
	return score
}

func (s *Service) computeStage(score int, lead *domain.Lead, signal LeadSignal) domain.Stage {
	if lead.HandoffRequired || (score >= s.handoffThreshold && hasLeadQualificationComplete(lead)) {
		return domain.StageHandoff
	}
	if hasLeadQualificationComplete(lead) {
		return domain.StageConvert
	}
	if hasAnyLeadData(lead) {
		return domain.StageQualify
	}
	return domain.StageDiscover
}

func (s *Service) shouldHandoff(bot domain.BotKnowledge, score int, stage domain.Stage, signal LeadSignal, lead *domain.Lead) HandoffDecision {
	if !isLeadReadyForHandoff(stage, score, signal, lead) {
		return HandoffDecision{}
	}
	if stage == domain.StageHandoff {
		return HandoffDecision{Required: true, Reason: bot.Handoff.Reason}
	}
	if score >= firstNonZero(bot.Handoff.ThresholdScore, s.handoffThreshold) {
		return HandoffDecision{Required: true, Reason: bot.Handoff.Reason}
	}
	if signal.EventType == "handoff_intent_detected" {
		return HandoffDecision{Required: true, Reason: "El visitante solicitÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³ contacto con un asesor."}
	}
	return HandoffDecision{}
}

func buildLeadSnapshot(lead *domain.Lead) LeadSnapshot {
	return LeadSnapshot{
		ID:                   lead.ID,
		Name:                 lead.Name,
		Email:                lead.Email,
		Phone:                lead.Phone,
		Interest:             lead.Interest,
		Travelers:            lead.Travelers,
		PreferredContactTime: lead.PreferredContactTime,
		TravelDate:           lead.TravelDate,
		Priority:             lead.Priority,
		SpecialOccasion:      lead.SpecialOccasion,
		Stage:                lead.Stage,
		Score:                lead.Score,
		HandoffRequired:      lead.HandoffRequired,
		HandoffReason:        lead.HandoffReason,
	}
}

func hasAttributionData(attribution domain.Attribution) bool {
	return strings.TrimSpace(attribution.UTMSource) != "" ||
		strings.TrimSpace(attribution.UTMMedium) != "" ||
		strings.TrimSpace(attribution.UTMCampaign) != "" ||
		strings.TrimSpace(attribution.UTMContent) != "" ||
		strings.TrimSpace(attribution.UTMTerm) != "" ||
		strings.TrimSpace(attribution.FBCLID) != "" ||
		strings.TrimSpace(attribution.Referrer) != "" ||
		strings.TrimSpace(attribution.LandingSlug) != "" ||
		strings.TrimSpace(attribution.Destination) != "" ||
		strings.TrimSpace(attribution.PagePath) != ""
}

func mergeAttribution(current, next domain.Attribution) domain.Attribution {
	merged := current
	if strings.TrimSpace(merged.UTMSource) == "" {
		merged.UTMSource = strings.TrimSpace(next.UTMSource)
	}
	if strings.TrimSpace(merged.UTMMedium) == "" {
		merged.UTMMedium = strings.TrimSpace(next.UTMMedium)
	}
	if strings.TrimSpace(merged.UTMCampaign) == "" {
		merged.UTMCampaign = strings.TrimSpace(next.UTMCampaign)
	}
	if strings.TrimSpace(merged.UTMContent) == "" {
		merged.UTMContent = strings.TrimSpace(next.UTMContent)
	}
	if strings.TrimSpace(merged.UTMTerm) == "" {
		merged.UTMTerm = strings.TrimSpace(next.UTMTerm)
	}
	if strings.TrimSpace(merged.FBCLID) == "" {
		merged.FBCLID = strings.TrimSpace(next.FBCLID)
	}
	if strings.TrimSpace(merged.Referrer) == "" {
		merged.Referrer = strings.TrimSpace(next.Referrer)
	}
	if strings.TrimSpace(merged.LandingSlug) == "" {
		merged.LandingSlug = strings.TrimSpace(next.LandingSlug)
	}
	if strings.TrimSpace(merged.Destination) == "" {
		merged.Destination = strings.TrimSpace(next.Destination)
	}
	if strings.TrimSpace(merged.PagePath) == "" {
		merged.PagePath = strings.TrimSpace(next.PagePath)
	}
	return merged
}

func attributionMetadata(attribution domain.Attribution) map[string]any {
	return map[string]any{
		"utm_source":   strings.TrimSpace(attribution.UTMSource),
		"utm_medium":   strings.TrimSpace(attribution.UTMMedium),
		"utm_campaign": strings.TrimSpace(attribution.UTMCampaign),
		"utm_content":  strings.TrimSpace(attribution.UTMContent),
		"utm_term":     strings.TrimSpace(attribution.UTMTerm),
		"fbclid":       strings.TrimSpace(attribution.FBCLID),
		"referrer":     strings.TrimSpace(attribution.Referrer),
		"landing_slug": strings.TrimSpace(attribution.LandingSlug),
		"destination":  strings.TrimSpace(attribution.Destination),
		"page_path":    strings.TrimSpace(attribution.PagePath),
	}
}

func buildConversationSummary(lead *domain.Lead, conversation *domain.Conversation, userMessage string, signal LeadSignal) string {
	parts := []string{
		"bot=" + conversation.BotSlug,
		"stage=" + string(lead.Stage),
		"score=" + fmt.Sprintf("%d", lead.Score),
	}
	if lead.Name != "" {
		parts = append(parts, "name="+lead.Name)
	}
	if lead.Interest != "" {
		parts = append(parts, "interest="+lead.Interest)
	}
	if lead.Travelers != "" {
		parts = append(parts, "travelers="+lead.Travelers)
	}
	if lead.TravelDate != "" {
		parts = append(parts, "travel_date="+lead.TravelDate)
	}
	if lead.Priority != "" {
		parts = append(parts, "priority="+lead.Priority)
	}
	if signal.EventType != "" {
		parts = append(parts, "event="+signal.EventType)
	}
	parts = append(parts, "last="+truncate(userMessage, 120))
	return strings.Join(parts, " | ")
}

func hasMinimumContactData(lead *domain.Lead) bool {
	return strings.TrimSpace(lead.Name) != "" &&
		strings.TrimSpace(lead.Phone) != ""
}

func hasAnyLeadData(lead *domain.Lead) bool {
	return strings.TrimSpace(lead.Name) != "" ||
		strings.TrimSpace(lead.Email) != "" ||
		strings.TrimSpace(lead.Phone) != "" ||
		strings.TrimSpace(lead.Interest) != "" ||
		strings.TrimSpace(lead.Travelers) != "" ||
		strings.TrimSpace(lead.TravelDate) != "" ||
		strings.TrimSpace(lead.SpecialOccasion) != "" ||
		strings.TrimSpace(lead.PreferredContactTime) != ""
}

func hasTripContext(lead *domain.Lead) bool {
	return strings.TrimSpace(lead.Interest) != "" ||
		strings.TrimSpace(lead.Travelers) != "" ||
		strings.TrimSpace(lead.TravelDate) != "" ||
		strings.TrimSpace(lead.SpecialOccasion) != ""
}

func hasLeadQualificationComplete(lead *domain.Lead) bool {
	return hasMinimumContactData(lead) &&
		strings.TrimSpace(lead.Interest) != "" &&
		strings.TrimSpace(lead.Travelers) != "" &&
		strings.TrimSpace(lead.TravelDate) != "" &&
		strings.TrimSpace(lead.SpecialOccasion) != "" &&
		strings.TrimSpace(lead.PreferredContactTime) != ""
}

func isLeadReadyForHandoff(stage domain.Stage, score int, signal LeadSignal, lead *domain.Lead) bool {
	if !hasLeadQualificationComplete(lead) {
		return false
	}
	return stage == domain.StageHandoff || score >= 80 || signal.EventType == "handoff_intent_detected"
}

func ResolveBotSlug(botSlug, landingURL, defaultSlug string) string {
	candidate := strings.TrimSpace(botSlug)
	if candidate != "" {
		return normalizeSlug(candidate)
	}
	if candidate = landingSlugFromURL(landingURL); candidate != "" {
		return normalizeSlug(candidate)
	}
	return normalizeSlug(defaultSlug)
}

func landingSlugFromURL(raw string) string {
	trimmed := strings.TrimSpace(raw)
	if trimmed == "" {
		return "home"
	}

	if parsed, err := url.Parse(trimmed); err == nil && parsed.Scheme != "" {
		trimmed = parsed.Path
	}

	trimmed = strings.Trim(trimmed, "/")
	if trimmed == "" {
		return "home"
	}
	parts := strings.Split(trimmed, "/")
	return normalizeSlug(parts[0])
}

func normalizeSlug(value string) string {
	value = strings.TrimSpace(strings.ToLower(value))
	value = strings.ReplaceAll(value, "_", "-")
	return value
}

func firstNonEmpty(values ...string) string {
	for _, value := range values {
		if strings.TrimSpace(value) != "" {
			return value
		}
	}
	return ""
}

func firstNonZero(values ...int) int {
	for _, value := range values {
		if value > 0 {
			return value
		}
	}
	return 0
}

func clampInt(value, min, max, fallback int) int {
	if value < min || value > max {
		return fallback
	}
	return value
}

func newID(prefix string) string {
	return prefix + "_" + fmt.Sprintf("%d", time.Now().UnixNano())
}

func truncate(value string, limit int) string {
	value = strings.TrimSpace(value)
	if len(value) <= limit {
		return value
	}
	return value[:limit]
}

type systemClock struct{}

func (systemClock) Now() time.Time { return time.Now() }

type LeadSignal struct {
	EventType string
	Details   map[string]any
}

type HandoffDecision struct {
	Required bool
	Reason   string
}
