package application

import (
	"context"
	"strings"
	"testing"
	"time"

	"backend/internal/chat/domain"
)

type fixedClock struct {
	now time.Time
}

func (c fixedClock) Now() time.Time { return c.now }

type fakeLLMClient struct {
	enabled  bool
	response LLMResponse
	err      error
	calls    []PromptRequest
}

func (f *fakeLLMClient) Enabled() bool { return f.enabled }

func (f *fakeLLMClient) Generate(ctx context.Context, req PromptRequest) (LLMResponse, error) {
	f.calls = append(f.calls, req)
	if f.err != nil {
		return LLMResponse{}, f.err
	}
	return f.response, nil
}

func TestReinforceResponseContinuityAvoidsReaskingInterest(t *testing.T) {
	bot := domain.BotKnowledge{
		Itineraries: []domain.Itinerary{
			{Name: "Alma de Japon"},
			{Name: "Japon Pop"},
			{Name: "Ruta del Shogun"},
		},
	}
	lead := &domain.Lead{
		Name:     "Carlos",
		Interest: "Japon Pop",
	}

	reply := reinforceResponseContinuity(
		"Cual de estas experiencias le atrae mas: Alma de Japon, Japon Pop o Ruta del Shogun?",
		lead,
		bot,
	)

	if strings.Contains(strings.ToLower(reply), "cual de estas experiencias") {
		t.Fatalf("expected continuity bridge instead of requalifying interest, got %q", reply)
	}
	if !strings.Contains(strings.ToLower(reply), "telefono") && !strings.Contains(strings.ToLower(reply), "whatsapp") {
		t.Fatalf("expected continuity bridge to move to the next capture step, got %q", reply)
	}
}

func TestBuildRuleResponseUsesKnownItineraryForIncludes(t *testing.T) {
	bot := domain.BotKnowledge{
		Itineraries: []domain.Itinerary{
			{
				Name:       "Japon Pop",
				IdealFor:   "familias, parejas jovenes y fans del anime",
				Highlights: []string{"anime", "tecnologia", "parques tematicos"},
			},
		},
		QualificationQuestions: []string{
			"Me comparte su nombre?",
		},
	}
	conversation := &domain.Conversation{Stage: domain.StageQualify}
	lead := &domain.Lead{Interest: "Japon Pop"}
	now := time.Date(2026, time.June, 18, 12, 0, 0, 0, time.UTC)

	reply := BuildRuleResponse(bot, conversation, lead, "Que incluye?", now, HandoffDecision{})

	if !strings.Contains(reply, "Japon Pop") {
		t.Fatalf("expected itinerary-aware response, got %q", reply)
	}
	if !strings.Contains(strings.ToLower(reply), "anime") {
		t.Fatalf("expected highlights in response, got %q", reply)
	}
}

func TestBuildRuleResponseUsesKnownItineraryForPricing(t *testing.T) {
	bot := domain.BotKnowledge{
		Itineraries: []domain.Itinerary{
			{
				Name:  "Alma de Japon",
				Price: "Desde $5,703 USD base doble",
			},
			{
				Name:  "Japon Pop",
				Price: "Desde $6,478 USD base doble",
			},
		},
	}
	lead := &domain.Lead{
		Name:     "Ismael",
		Interest: "Alma de Japon",
	}
	now := time.Date(2026, time.June, 18, 12, 0, 0, 0, time.UTC)

	reply := BuildRuleResponse(bot, &domain.Conversation{}, lead, "que costo tiene el itinerario?", now, HandoffDecision{})

	if !strings.Contains(reply, "Alma de Japon") {
		t.Fatalf("expected known itinerary in pricing reply, got %q", reply)
	}
	if strings.Contains(reply, "Japon Pop") {
		t.Fatalf("expected pricing reply to avoid unrelated itineraries, got %q", reply)
	}
	if !strings.Contains(reply, "$5,703 USD") {
		t.Fatalf("expected itinerary price in reply, got %q", reply)
	}
	if !strings.Contains(strings.ToLower(reply), "telefono") && !strings.Contains(strings.ToLower(reply), "whatsapp") {
		t.Fatalf("expected pricing reply to continue with the next strict step, got %q", reply)
	}
}

func TestFallbackQuestionUsesStrictNextStepAfterName(t *testing.T) {
	bot := domain.BotKnowledge{}
	lead := &domain.Lead{
		Name: "Ismael",
	}

	reply := fallbackQuestion(bot, lead, &domain.Conversation{})

	lower := strings.ToLower(reply)
	if !strings.Contains(lower, "telefono") && !strings.Contains(lower, "whatsapp") {
		t.Fatalf("expected fallback to ask for phone after name, got %q", reply)
	}
	if strings.Contains(lower, "correo") {
		t.Fatalf("expected fallback to avoid asking for email before phone, got %q", reply)
	}
}

func TestFallbackQuestionUsesHandoffClosingWhenLeadComplete(t *testing.T) {
	bot := domain.BotKnowledge{
		Handoff: domain.HandoffRule{
			ClosingMessage: "Con gusto continuamos con su cotizacion de Japon Premium. Un asesor especializado le dara seguimiento en breve.",
		},
	}
	lead := &domain.Lead{
		Name:                 "Karim Bernal",
		Phone:                "+525589893457",
		Email:                "karim@gmail.com",
		TravelDate:           "2026-07-01",
		Interest:             "Japon Pop",
		Travelers:            "2",
		SpecialOccasion:      "Sin motivo especial",
		PreferredContactTime: "a las 08:00",
	}

	reply := fallbackQuestion(bot, lead, &domain.Conversation{})
	lower := strings.ToLower(reply)

	if strings.Contains(lower, "ayudarle a elegir") {
		t.Fatalf("expected complete lead to avoid generic itinerary offer, got %q", reply)
	}
	if !strings.Contains(lower, "seguimiento") {
		t.Fatalf("expected complete lead to hand off to an advisor, got %q", reply)
	}
}

func TestBuildRuleResponsePricingAsksNameWhenMissing(t *testing.T) {
	bot := domain.BotKnowledge{
		Itineraries: []domain.Itinerary{
			{Name: "Alma de Japon", Price: "Desde $5,703 USD base doble"},
		},
	}
	now := time.Date(2026, time.June, 18, 12, 0, 0, 0, time.UTC)

	reply := BuildRuleResponse(bot, &domain.Conversation{}, &domain.Lead{}, "cuanto cuesta alma de japon", now, HandoffDecision{})

	if !strings.Contains(strings.ToLower(reply), "nombre") {
		t.Fatalf("expected pricing reply to ask for name first when missing, got %q", reply)
	}
}

func TestEnsureResponseAdvancesFlowAppendsNextQuestionWhenMissing(t *testing.T) {
	bot := domain.BotKnowledge{}
	lead := &domain.Lead{}

	reply := ensureResponseAdvancesFlow(
		"Con mucho gusto. Los precios base son Alma de Japon desde $5,703 USD, Japon Pop desde $6,478 USD y Ruta del Shogun desde $5,938 USD",
		bot,
		lead,
		&domain.Conversation{},
		"",
	)

	if !strings.Contains(strings.ToLower(reply), "nombre") {
		t.Fatalf("expected response to append next required step, got %q", reply)
	}
}

func TestEnsureResponseAdvancesFlowKeepsExistingQuestion(t *testing.T) {
	bot := domain.BotKnowledge{}
	lead := &domain.Lead{}
	original := "Con gusto. Los precios base ya estan listos. Me comparte su nombre?"

	reply := ensureResponseAdvancesFlow(original, bot, lead, &domain.Conversation{}, "")
	if reply != original {
		t.Fatalf("expected existing follow-up to stay unchanged, got %q", reply)
	}
}

func TestEnsureResponseAdvancesFlowKeepsExistingPhoneRequestWithoutQuestionMark(t *testing.T) {
	bot := domain.BotKnowledge{}
	lead := &domain.Lead{}
	original := "Con gusto. Podemos ajustar una propuesta personalizada con los destinos que mas le entusiasmen. Para poder compartirle opciones concretas y la cotizacion, me regala su numero de telefono o WhatsApp"

	reply := ensureResponseAdvancesFlow(original, bot, lead, &domain.Conversation{}, "")
	if reply != original {
		t.Fatalf("expected existing phone request to stay unchanged, got %q", reply)
	}
}

func TestEnsureResponseAdvancesFlowKeepsQuestionWithoutAppendingFollowUp(t *testing.T) {
	bot := domain.BotKnowledge{}
	lead := &domain.Lead{
		Name: "Ismael Contreras",
	}
	original := "Con gusto, Ismael Contreras. Nuestros itinerarios principales son Alma de Japon, Japon Pop y Ruta del Shogun. ¿Hay alguno que llame más su atención para conocerlo a detalle?"

	reply := ensureResponseAdvancesFlow(original, bot, lead, &domain.Conversation{}, "Que itinerarios tienen?")
	if reply != original {
		t.Fatalf("expected existing question to stay unchanged, got %q", reply)
	}
}

func TestEnsureResponseAdvancesFlowDoesNotAppendOnAdvisorClosing(t *testing.T) {
	bot := domain.BotKnowledge{}
	lead := &domain.Lead{
		Name:                 "Karim Bernal",
		Interest:             "Japon Pop",
		Phone:                "+525589893457",
		Email:                "karim@gmail.com",
		TravelDate:           "2026-07-01",
		Travelers:            "3",
		SpecialOccasion:      "Es mi graduacion",
		PreferredContactTime: "a las 18:00",
	}
	original := "Todo esta listo de mi parte. Un asesor especializado le contactara manana a las 6:00 a.m. para darle seguimiento."

	reply := ensureResponseAdvancesFlow(original, bot, lead, &domain.Conversation{}, "")
	if reply != original {
		t.Fatalf("expected advisor closing to stay unchanged, got %q", reply)
	}
}

func TestRepairIncompleteResponseFallsBackToCompleteAnswer(t *testing.T) {
	bot := domain.BotKnowledge{
		Itineraries: []domain.Itinerary{
			{
				Name:  "Japon Pop",
				Price: "Desde $6,478 USD base doble",
			},
		},
		QualificationQuestions: []string{
			"Perfecto. Para continuar, me podria compartir su nombre completo?",
		},
	}
	conversation := &domain.Conversation{Stage: domain.StageQualify}
	lead := &domain.Lead{
		Interest: "Japon Pop",
	}
	now := time.Date(2026, time.June, 18, 12, 0, 0, 0, time.UTC)

	reply := repairIncompleteResponse(
		"Es un placer saber de usted. El itinerario Japon Pop es completamente personalizable. Para comenzar a perfilar su experiencia, podria indicarme su nombre y un",
		bot,
		conversation,
		lead,
		"Tenemos planeado viajar el siguiente ano",
		HandoffDecision{},
		now,
	)

	if strings.Contains(strings.ToLower(reply), " y un") {
		t.Fatalf("expected incomplete response to be repaired, got %q", reply)
	}
	if !strings.HasSuffix(reply, "?") && !strings.HasSuffix(reply, ".") {
		t.Fatalf("expected repaired response to end cleanly, got %q", reply)
	}
}

func TestBuildRuleResponseSharesContactInfo(t *testing.T) {
	bot := domain.BotKnowledge{Slug: "japon-premium"}
	now := time.Date(2026, time.June, 18, 12, 0, 0, 0, time.UTC)

	reply := BuildRuleResponse(bot, &domain.Conversation{}, &domain.Lead{}, "donde puedo marcar en este momento", now, HandoffDecision{})

	if !strings.Contains(reply, "+52 55 4161 9428") {
		t.Fatalf("expected brand phone in reply, got %q", reply)
	}
}

func TestBuildRuleResponseHandlesAccentedContactQuestion(t *testing.T) {
	bot := domain.BotKnowledge{Slug: "japon-premium"}
	now := time.Date(2026, time.June, 18, 12, 0, 0, 0, time.UTC)

	reply := BuildRuleResponse(bot, &domain.Conversation{}, &domain.Lead{}, "¿Cuál es su teléfono?", now, HandoffDecision{})

	lower := strings.ToLower(reply)
	if !strings.Contains(lower, "whatsapp") && !strings.Contains(lower, "telefono") {
		t.Fatalf("expected accented contact question to be recognized, got %q", reply)
	}
	if !strings.Contains(lower, "nombre") {
		t.Fatalf("expected strict follow-up to continue after contact answer, got %q", reply)
	}
}

func TestBuildRuleResponseValidatesInvalidDay(t *testing.T) {
	bot := domain.BotKnowledge{Slug: "europa-premium"}
	now := time.Date(2026, time.June, 18, 12, 0, 0, 0, time.UTC)

	reply := BuildRuleResponse(bot, &domain.Conversation{}, &domain.Lead{}, "diciembre 46", now, HandoffDecision{})

	lower := strings.ToLower(reply)
	if !strings.Contains(lower, "no existe") || !strings.Contains(lower, "fecha valida") {
		t.Fatalf("expected invalid day warning, got %q", reply)
	}
}

func TestBuildRuleResponseHandlesYearOnlyDate(t *testing.T) {
	bot := domain.BotKnowledge{Slug: "europa-premium"}
	now := time.Date(2026, time.June, 18, 12, 0, 0, 0, time.UTC)

	reply := BuildRuleResponse(bot, &domain.Conversation{}, &domain.Lead{}, "2030", now, HandoffDecision{})
	lower := strings.ToLower(reply)

	if !strings.Contains(lower, "financiamiento") && !strings.Contains(lower, "costo") {
		t.Fatalf("expected year-only far horizon response, got %q", reply)
	}
	if !strings.Contains(lower, "2030") {
		t.Fatalf("expected year-only response to acknowledge the year, got %q", reply)
	}
}

func TestBuildRuleResponseAcknowledgesValidTravelDateBeforeNextStep(t *testing.T) {
	bot := domain.BotKnowledge{Slug: "japon-premium"}
	now := time.Date(2026, time.June, 18, 12, 0, 0, 0, time.UTC)
	lead := &domain.Lead{}

	reply := BuildRuleResponse(bot, &domain.Conversation{}, lead, "Quiero viajar en diciembre", now, HandoffDecision{})
	lower := strings.ToLower(reply)

	if !strings.Contains(lower, "diciembre") {
		t.Fatalf("expected the bot to acknowledge the travel month, got %q", reply)
	}
	if !strings.Contains(lower, "nombre") {
		t.Fatalf("expected the bot to continue with the next capture step, got %q", reply)
	}
	if strings.Contains(lower, "recomienda viajar entre 10 y 15 dias") {
		t.Fatalf("expected the faq answer to be avoided on a travel intent statement, got %q", reply)
	}
}

func TestBuildRuleResponseHandlesTravelDatesBeyondPlanningHorizon(t *testing.T) {
	bot := domain.BotKnowledge{Slug: "japon-premium"}
	now := time.Date(2026, time.June, 18, 12, 0, 0, 0, time.UTC)
	lead := &domain.Lead{Name: "Jose"}

	reply := BuildRuleResponse(bot, &domain.Conversation{}, lead, "Marzo de 2035", now, HandoffDecision{})
	lower := strings.ToLower(reply)

	if !strings.Contains(lower, "aun no contamos con tarifas ni vuelos") {
		t.Fatalf("expected long-range travel response to mention missing fares and flights, got %q", reply)
	}
	if !strings.Contains(lower, "anticipar una compra") || !strings.Contains(lower, "planearlo a futuro") {
		t.Fatalf("expected long-range travel response to explain the price purpose, got %q", reply)
	}
}

func TestBuildRuleResponseRespectsFollowupOptOut(t *testing.T) {
	bot := domain.BotKnowledge{Slug: "japon-premium"}
	now := time.Date(2026, time.June, 18, 12, 0, 0, 0, time.UTC)
	lead := &domain.Lead{Name: "Jose"}
	conversation := &domain.Conversation{
		Metadata: map[string]any{"followup_declined": true},
	}

	reply := BuildRuleResponse(bot, conversation, lead, "No quiero seguimiento", now, HandoffDecision{})
	lower := strings.ToLower(reply)

	if strings.Contains(lower, "telefono") || strings.Contains(lower, "whatsapp") {
		t.Fatalf("expected opt-out response to stop asking for contact data, got %q", reply)
	}
	if strings.Contains(lower, "?") {
		t.Fatalf("expected opt-out response to close without more questions, got %q", reply)
	}
}

func TestBuildRuleResponseDoesNotTreatPhoneLikeDigitsAsDate(t *testing.T) {
	bot := domain.BotKnowledge{Slug: "japon-premium"}
	now := time.Date(2026, time.June, 18, 12, 0, 0, 0, time.UTC)

	reply := BuildRuleResponse(bot, &domain.Conversation{}, &domain.Lead{}, "5555555555", now, HandoffDecision{})
	lower := strings.ToLower(reply)

	if strings.Contains(lower, "mes y el dia") || strings.Contains(lower, "fecha valida") {
		t.Fatalf("expected phone-like digits not to be treated as a date, got %q", reply)
	}
	if !strings.Contains(lower, "numero") || !strings.Contains(lower, "valido") {
		t.Fatalf("expected phone-like digits to trigger an explicit invalid phone warning, got %q", reply)
	}
}

func TestBuildRuleResponseWarnsOnInvalidEmailAttempt(t *testing.T) {
	bot := domain.BotKnowledge{Slug: "japon-premium"}
	now := time.Date(2026, time.June, 18, 12, 0, 0, 0, time.UTC)

	reply := BuildRuleResponse(bot, &domain.Conversation{}, &domain.Lead{}, "mi correo es cliente@dominio", now, HandoffDecision{})
	lower := strings.ToLower(reply)

	if !strings.Contains(lower, "correo") || !strings.Contains(lower, "valido") {
		t.Fatalf("expected explicit invalid email warning, got %q", reply)
	}
	if !strings.Contains(lower, "podrias compartir uno valido") {
		t.Fatalf("expected invalid email warning to ask for a valid email, got %q", reply)
	}
}

func TestDetectPreferredContactTimeRejectsTripDurationPhrases(t *testing.T) {
	if value := detectPreferredContactTime("Ismael, dispongo de 10 dias solamente"); value != "" {
		t.Fatalf("expected trip duration to not be treated as preferred contact time, got %q", value)
	}
}

func TestShouldUseAILeadExtractionOnlyForMixedCases(t *testing.T) {
	service := &Service{
		llm: &fakeLLMClient{enabled: true},
	}
	bot := domain.BotKnowledge{}
	now := time.Date(2026, time.June, 23, 12, 0, 0, 0, time.UTC)

	if service.shouldUseAILeadExtraction(bot, "Me llamo Ismael", &domain.Lead{}, now) {
		t.Fatalf("expected simple name capture to stay on deterministic rules only")
	}
	if !service.shouldUseAILeadExtraction(bot, "Me llamo Ismael, viajo a principios del mes entrante y cuento con 10 dias de vacaciones", &domain.Lead{}, now) {
		t.Fatalf("expected mixed lead capture to escalate to the AI extractor")
	}
}

func TestGenerateResponseUsesLLMForLeadCaptureStatements(t *testing.T) {
	llm := &fakeLLMClient{
		enabled: true,
		response: LLMResponse{
			Text:   "Gracias, Ismael.",
			Source: "llm",
		},
	}
	service := &Service{
		llm:   llm,
		clock: fixedClock{now: time.Date(2026, time.June, 23, 12, 0, 0, 0, time.UTC)},
	}
	bot := domain.BotKnowledge{
		QualificationQuestions: []string{
			"Me comparte su nombre para seguir ayudandole con la propuesta?",
			"Me comparte su numero de telefono o WhatsApp?",
		},
	}
	conversation := &domain.Conversation{Stage: domain.StageQualify}
	lead := &domain.Lead{Name: "Ismael Contreras"}

	reply, source, err := service.generateResponse(
		context.Background(),
		bot,
		conversation,
		lead,
		nil,
		"Ismael Contreras",
		HandoffDecision{},
	)

	if err != nil {
		t.Fatalf("expected LLM response path to succeed, got error: %v", err)
	}
	if len(llm.calls) == 0 {
		t.Fatalf("expected the LLM to be called for a simple lead statement")
	}
	if source != "llm" {
		t.Fatalf("expected llm source, got %q with reply %q", source, reply)
	}
	if !strings.Contains(strings.ToLower(reply), "ismael") {
		t.Fatalf("expected personalized reply to keep the user's name, got %q", reply)
	}
}

func TestGenerateResponseUsesLLMForItineraryCatalogQuestions(t *testing.T) {
	llm := &fakeLLMClient{
		enabled: true,
		response: LLMResponse{
			Text:   "Con gusto, Ismael Contreras. Nuestros itinerarios principales son Alma de Japon, Japon Pop y Ruta del Shogun.",
			Source: "llm",
		},
	}
	service := &Service{
		llm:   llm,
		clock: fixedClock{now: time.Date(2026, time.June, 23, 12, 0, 0, 0, time.UTC)},
	}
	bot := domain.BotKnowledge{
		Itineraries: []domain.Itinerary{
			{Name: "Alma de Japon", Duration: "14 dias", Price: "Desde $5,703 USD base doble"},
			{Name: "Japon Pop", Duration: "14 dias", Price: "Desde $6,478 USD base doble"},
			{Name: "Ruta del Shogun", Duration: "15 dias", Price: "Desde $5,938 USD base doble"},
		},
	}
	lead := &domain.Lead{Name: "Ismael Contreras"}
	conversation := &domain.Conversation{Stage: domain.StageQualify}

	reply, source, err := service.generateResponse(
		context.Background(),
		bot,
		conversation,
		lead,
		nil,
		"Que itinerarios tienen?",
		HandoffDecision{},
	)

	if err != nil {
		t.Fatalf("expected catalog response to succeed, got error: %v", err)
	}
	if len(llm.calls) == 0 {
		t.Fatalf("expected itinerary catalog question to call the LLM")
	}
	if source != "llm" {
		t.Fatalf("expected llm source for catalog question, got %q with reply %q", source, reply)
	}
	if !strings.Contains(strings.ToLower(reply), "itinerarios principales") {
		t.Fatalf("expected itinerary-focused reply, got %q", reply)
	}
	if strings.Contains(strings.ToLower(reply), "telefono") || strings.Contains(strings.ToLower(reply), "whatsapp") {
		t.Fatalf("expected itinerary response not to jump to phone capture, got %q", reply)
	}
}

func TestExtractLeadSignalsUsesAIForAmbiguousTravelDate(t *testing.T) {
	llm := &fakeLLMClient{
		enabled: true,
		response: LLMResponse{
			Text:   `{"updates":{"travel_date":"proximo mes","preferred_contact_time":"por la tarde"}}`,
			Source: "llm",
		},
	}
	service := &Service{
		llm:   llm,
		clock: fixedClock{now: time.Date(2026, time.June, 23, 12, 0, 0, 0, time.UTC)},
	}
	lead := &domain.Lead{}
	conversation := &domain.Conversation{Stage: domain.StageQualify}
	now := time.Date(2026, time.June, 23, 12, 0, 0, 0, time.UTC)

	updated, _ := service.extractLeadSignals(
		context.Background(),
		domain.BotKnowledge{},
		lead,
		"Me llamo Ismael, viajo a principios del mes entrante y cuento con 10 dias de vacaciones",
		conversation,
		now,
	)

	if len(llm.calls) == 0 {
		t.Fatalf("expected ambiguous message to invoke the AI extractor")
	}
	if updated.Name != "Ismael" {
		t.Fatalf("expected deterministic name capture to remain intact, got %q", updated.Name)
	}
	if updated.TravelDate != "2026-07-01" {
		t.Fatalf("expected AI to fill the travel date as ISO, got %q", updated.TravelDate)
	}
	if updated.Priority != "urgente" {
		t.Fatalf("expected AI-filled travel date to set urgent priority, got %q", updated.Priority)
	}
}

func TestExtractLeadSignalsUpgradesInterestToKnownItinerary(t *testing.T) {
	bot := domain.BotKnowledge{
		Itineraries: []domain.Itinerary{
			{Name: "Japon Pop", Highlights: []string{"anime", "series"}},
			{Name: "Alma de Japon", Highlights: []string{"onsen"}},
		},
	}
	lead := &domain.Lead{Interest: "Hokkaido"}
	service := &Service{}

	updated, signal := service.extractLeadSignals(context.Background(), bot, lead, "tambien quisiera pasar por shibuya y cononcer el japon de las peliculas y series", &domain.Conversation{}, time.Date(2026, time.June, 23, 12, 0, 0, 0, time.UTC))

	if updated.Interest != "Japon Pop" {
		t.Fatalf("expected interest to upgrade to Japon Pop, got %q", updated.Interest)
	}
	if signal.Details["interest"] != "Japon Pop" {
		t.Fatalf("expected interest signal to reflect upgraded itinerary, got %#v", signal.Details["interest"])
	}
}

func TestComputeScoreDoesNotPromotePartialLeadToHandoff(t *testing.T) {
	bot := domain.BotKnowledge{
		Itineraries: []domain.Itinerary{
			{Name: "Japon Pop", Highlights: []string{"anime"}},
		},
	}
	lead := &domain.Lead{
		Name:     "Yan",
		Phone:    "+52551345939413",
		Interest: "Japon Pop",
	}
	conversation := &domain.Conversation{Stage: domain.StageQualify}

	score := (&Service{handoffThreshold: 70}).computeScore(bot, lead, conversation, "tambien quisiera pasar por shibuya y cononcer el japon de las peliculas y series")

	if score >= 70 {
		t.Fatalf("expected partial lead to stay below handoff threshold, got %d", score)
	}
}

func TestBuildRuleResponsePricesKnownItineraryFromMessage(t *testing.T) {
	bot := domain.BotKnowledge{
		Itineraries: []domain.Itinerary{
			{Name: "Japon Pop", Price: "Desde $6,478 USD base doble"},
		},
	}
	now := time.Date(2026, time.June, 18, 12, 0, 0, 0, time.UTC)

	reply := BuildRuleResponse(bot, &domain.Conversation{}, &domain.Lead{}, "Cuanto vale el itinerario de japon pop", now, HandoffDecision{})

	if !strings.Contains(reply, "Japon Pop") {
		t.Fatalf("expected itinerary name in pricing reply, got %q", reply)
	}
	if !strings.Contains(reply, "$6,478 USD") {
		t.Fatalf("expected base price in reply, got %q", reply)
	}
	if strings.Contains(strings.ToLower(reply), "pasaj") {
		t.Fatalf("expected pricing reply to stay focused on the base price, got %q", reply)
	}
}

func TestBuildRuleResponsePrioritizesPricingOverTravelMonthQuestion(t *testing.T) {
	bot := domain.BotKnowledge{
		Itineraries: []domain.Itinerary{
			{Name: "Alma de Japon", Price: "Desde $5,703 USD base doble"},
			{Name: "Japon Pop", Price: "Desde $6,478 USD base doble"},
			{Name: "El Camino del Shogun", Price: "Desde $5,938 USD base doble"},
		},
	}
	now := time.Date(2026, time.June, 18, 12, 0, 0, 0, time.UTC)

	reply := BuildRuleResponse(bot, &domain.Conversation{}, &domain.Lead{}, "En diciembre pero cuanto es en pesos mexicanos??", now, HandoffDecision{})
	lower := strings.ToLower(reply)

	if !strings.Contains(reply, "$5,703 USD") && !strings.Contains(reply, "$6,478 USD") && !strings.Contains(reply, "$5,938 USD") {
		t.Fatalf("expected pricing reply, got %q", reply)
	}
	if strings.Contains(lower, "fecha tentativa") || strings.Contains(lower, "tomo diciembre") {
		t.Fatalf("expected pricing reply to avoid date capture wording, got %q", reply)
	}
	if !strings.Contains(lower, "pesos mexicanos") && !strings.Contains(lower, "tipo de cambio") {
		t.Fatalf("expected pricing reply to acknowledge mexican pesos, got %q", reply)
	}
}

func TestBuildRuleResponseUsesCustomProposalWhenNoItineraryFits(t *testing.T) {
	bot := domain.BotKnowledge{
		Itineraries: []domain.Itinerary{
			{Name: "Alma de Japon", Price: "Desde $5,703 USD base doble"},
			{Name: "Japon Pop", Price: "Desde $6,478 USD base doble"},
		},
	}
	lead := &domain.Lead{
		Name:     "Ismael",
		Interest: "Japon Pop",
	}
	conversation := &domain.Conversation{Stage: domain.StageQualify}
	now := time.Date(2026, time.June, 18, 12, 0, 0, 0, time.UTC)

	reply := BuildRuleResponse(bot, conversation, lead, "ninguno de tus itinerarios me gusto, no tienes mas?", now, HandoffDecision{})
	lower := strings.ToLower(reply)

	if !strings.Contains(lower, "a medida") {
		t.Fatalf("expected custom proposal to be mentioned, got %q", reply)
	}
	if !strings.Contains(lower, "telefono") && !strings.Contains(lower, "whatsapp") {
		t.Fatalf("expected custom proposal to continue with phone capture, got %q", reply)
	}
}

func TestGeneralBrandResponseDoesNotSummarizeItineraryForDateUpdate(t *testing.T) {
	bot := domain.BotKnowledge{
		Itineraries: []domain.Itinerary{
			{
				Name:       "Japon Pop",
				IdealFor:   "familias, parejas jovenes y fans del anime",
				Highlights: []string{"anime", "tecnologia", "parques tematicos"},
			},
		},
	}
	lead := &domain.Lead{
		Interest: "Japon Pop",
	}
	conversation := &domain.Conversation{Stage: domain.StageQualify}

	if response := generalBrandResponse(bot, conversation, lead, "me llamo Ismael, mi viaje lo planeo realizar a inicios del proximo mes"); response != "" {
		t.Fatalf("expected date update to avoid itinerary summary, got %q", response)
	}
}

func TestBuildPromptIncludesMarkdownKnowledge(t *testing.T) {
	bot := domain.BotKnowledge{
		Slug:        "japon-premium",
		BrandName:   "Japon Premium",
		DisplayName: "Japon PREMIUM",
		Overview:    "Japon Premium disena experiencias cuidadosamente planeadas.",
		Itineraries: []domain.Itinerary{
			{
				Name:       "Japon Pop",
				Duration:   "14 dias",
				Summary:    "Un recorrido vibrante entre anime y tecnologia.",
				IdealFor:   "fans del anime",
				Highlights: []string{"anime", "tecnologia"},
				Price:      "Desde $6,478 USD base doble",
			},
		},
		FAQs: []domain.FAQ{
			{Question: "Se puede viajar sin hablar japones?", Answer: "Si."},
		},
		QualificationQuestions: []string{"Me comparte su nombre?"},
		ClosingPrompts:         []string{"Con gusto le preparo un siguiente paso."},
	}
	conversation := &domain.Conversation{Stage: domain.StageDiscover}
	lead := &domain.Lead{}
	now := time.Date(2026, time.June, 18, 12, 0, 0, 0, time.UTC)

	prompt := BuildPrompt(bot, conversation, lead, nil, "hola", "Me comparte su nombre?", 70, now)

	if !strings.Contains(prompt.SystemPrompt, "## Itinerarios") {
		t.Fatalf("expected markdown itineraries section in prompt, got %q", prompt.SystemPrompt)
	}
	if !strings.Contains(prompt.SystemPrompt, "Precio base: Desde $6,478 USD base doble") {
		t.Fatalf("expected markdown price in prompt, got %q", prompt.SystemPrompt)
	}
	if !strings.Contains(prompt.SystemPrompt, "## FAQs") {
		t.Fatalf("expected markdown faq section in prompt, got %q", prompt.SystemPrompt)
	}
	if !strings.Contains(prompt.SystemPrompt, "## Contacto") {
		t.Fatalf("expected markdown contact section in prompt, got %q", prompt.SystemPrompt)
	}
}

func TestDetectNameIgnoresTravelInterestPhrases(t *testing.T) {
	if name := detectName("Japon pop me interesa"); name != "" {
		t.Fatalf("expected travel intent to not be treated as a name, got %q", name)
	}
	if name := detectName("Entiendo, me interesa conocer europa"); name != "" {
		t.Fatalf("expected conversational acknowledgement to not be treated as a name, got %q", name)
	}
	if name := detectName("Puerto Vallarta"); name != "" {
		t.Fatalf("expected destination phrase to not be treated as a name, got %q", name)
	}
	if name := detectName("Me llamo Ismael"); name != "Ismael" {
		t.Fatalf("expected explicit name capture, got %q", name)
	}
	if name := detectName("Me interesa saber mas sobre el camino del shogun, me llamo ismael"); name != "ismael" {
		t.Fatalf("expected explicit name capture even with travel context, got %q", name)
	}
}

func TestDetectNameCapturesLeadingNameWithExtraContext(t *testing.T) {
	if name := detectName("Ismael, dispongo de 10 dias solamente"); name != "Ismael" {
		t.Fatalf("expected leading name to be captured before extra context, got %q", name)
	}
}

func TestExtractLeadSignalsSeparatesNameAndTravelDateFromMixedMessage(t *testing.T) {
	service := &Service{clock: fixedClock{now: time.Date(2026, time.June, 23, 12, 0, 0, 0, time.UTC)}}
	lead := &domain.Lead{
		Interest: "Japon Pop",
	}
	conversation := &domain.Conversation{Stage: domain.StageQualify}
	now := time.Date(2026, time.June, 23, 12, 0, 0, 0, time.UTC)

	updated, _ := service.extractLeadSignals(
		context.Background(),
		domain.BotKnowledge{},
		lead,
		"Me llamo Ismael, yo quiero viajar a japon este proximo mes, cuento con 10 dias de vacaciones",
		conversation,
		now,
	)

	if updated.Name != "Ismael" {
		t.Fatalf("expected name to be extracted from mixed message, got %q", updated.Name)
	}
	if updated.TravelDate != "2026-07-01" {
		t.Fatalf("expected travel date to be normalized as ISO, got %q", updated.TravelDate)
	}
	if strings.Contains(strings.ToLower(updated.TravelDate), "ismael") {
		t.Fatalf("expected travel date to exclude the name prefix, got %q", updated.TravelDate)
	}
	if updated.Priority != "urgente" {
		t.Fatalf("expected relative next-month travel date to be urgent, got %q", updated.Priority)
	}
}

func TestExtractLeadSignalsUpdatesTravelDateWhenUserCorrectsIt(t *testing.T) {
	service := &Service{clock: fixedClock{now: time.Date(2026, time.June, 23, 12, 0, 0, 0, time.UTC)}}
	lead := &domain.Lead{
		TravelDate: "2026-09-01",
	}
	conversation := &domain.Conversation{Stage: domain.StageQualify}
	now := time.Date(2026, time.June, 23, 12, 0, 0, 0, time.UTC)

	updated, _ := service.extractLeadSignals(
		context.Background(),
		domain.BotKnowledge{},
		lead,
		"Tienes razon, quiero viajar el 23 de septiembre, me llamo Ismael Contreras",
		conversation,
		now,
	)

	if updated.Name != "Ismael Contreras" {
		t.Fatalf("expected name to be updated from corrected message, got %q", updated.Name)
	}
	if updated.TravelDate != "2026-09-23" {
		t.Fatalf("expected travel date correction to replace the month-only value, got %q", updated.TravelDate)
	}
}
func TestNextCaptureQuestionPrefersNameForJapan(t *testing.T) {
	bot := domain.BotKnowledge{
		QualificationQuestions: []string{
			"Me comparte su nombre para seguir ayudandole con la propuesta?",
			"Que tipo de experiencia le interesa mas: Alma de Japon, Japon Pop, Ruta del Shogun o una extension como Hokkaido?",
		},
	}

	question := nextCaptureQuestion(bot, &domain.Lead{}, &domain.Conversation{})
	if !strings.Contains(strings.ToLower(question), "nombre") {
		t.Fatalf("expected name question to be prioritized, got %q", question)
	}
}

func TestNextCaptureQuestionFollowsConfiguredLeadCaptureOrder(t *testing.T) {
	bot := domain.BotKnowledge{
		LeadCapture: []string{"name", "phone", "email", "travel_date", "interest"},
	}
	lead := &domain.Lead{
		Name:  "Andrea",
		Phone: "+525511112222",
		Email: "andrea@example.com",
	}

	question := nextCaptureQuestion(bot, lead, &domain.Conversation{})
	lower := strings.ToLower(question)

	if !strings.Contains(lower, "fecha tentativa") && !strings.Contains(lower, "mes aproximado") {
		t.Fatalf("expected configured order to ask for travel date after email, got %q", question)
	}

	lead.TravelDate = "noviembre 2026"
	question = nextCaptureQuestion(bot, lead, &domain.Conversation{})
	lower = strings.ToLower(question)

	if !strings.Contains(lower, "itinerario") && !strings.Contains(lower, "experiencia") && !strings.Contains(lower, "inter") {
		t.Fatalf("expected interest to follow travel date in configured order, got %q", question)
	}
}

func TestNextCaptureQuestionPrioritizesInterestBeforeNameOnHome(t *testing.T) {
	bot := domain.BotKnowledge{
		LeadCapture: []string{"interest", "phone", "email", "travel_date", "name"},
	}
	lead := &domain.Lead{
		Interest: "Puerto Vallarta",
	}

	question := nextCaptureQuestion(bot, lead, &domain.Conversation{})
	lower := strings.ToLower(question)

	if !strings.Contains(lower, "telefono") && !strings.Contains(lower, "whatsapp") {
		t.Fatalf("expected home to move from destination to phone before name, got %q", question)
	}
	if strings.Contains(lower, "nombre") {
		t.Fatalf("expected home to avoid asking for name before contact info, got %q", question)
	}
}

func TestNextCaptureQuestionSkipsMixedConfiguredQuestionWhenPhoneAlreadyExists(t *testing.T) {
	bot := domain.BotKnowledge{
		QualificationQuestions: []string{
			"Me deja su correo y telefono para que un asesor le comparta opciones?",
		},
	}
	lead := &domain.Lead{
		Name:     "Ismael",
		Phone:    "+525590905645",
		Interest: "Japon Pop",
	}

	question := nextCaptureQuestion(bot, lead, &domain.Conversation{})
	lower := strings.ToLower(question)

	if !strings.Contains(lower, "correo") {
		t.Fatalf("expected next step to ask only for email, got %q", question)
	}
	if strings.Contains(lower, "telefono") {
		t.Fatalf("expected mixed configured question to be skipped when phone already exists, got %q", question)
	}
}

func TestNextCaptureQuestionKeepsStrictOrderBeforeTravelQuestions(t *testing.T) {
	bot := domain.BotKnowledge{}
	lead := &domain.Lead{
		Interest:   "Alma de Japon",
		TravelDate: "5 de agosto",
	}

	question := nextCaptureQuestion(bot, lead, &domain.Conversation{})
	if !strings.Contains(strings.ToLower(question), "nombre") {
		t.Fatalf("expected strict flow to ask for name before any later field, got %q", question)
	}
}

func TestBuildRuleResponseForDateDoesNotSkipRequiredFields(t *testing.T) {
	bot := domain.BotKnowledge{Slug: "japon-premium"}
	lead := &domain.Lead{
		Interest: "Alma de Japon",
	}
	now := time.Date(2026, time.June, 18, 12, 0, 0, 0, time.UTC)

	reply := BuildRuleResponse(bot, &domain.Conversation{}, lead, "5 de agosto", now, HandoffDecision{})

	if !strings.Contains(strings.ToLower(reply), "nombre") {
		t.Fatalf("expected date reply to continue with strict flow, got %q", reply)
	}
}

func TestNextCaptureQuestionRequestsTravelDateAfterEmailBeforeTravelers(t *testing.T) {
	bot := domain.BotKnowledge{}
	lead := &domain.Lead{
		Name:     "Andrea",
		Email:    "andrea@example.com",
		Phone:    "+525511112222",
		Interest: "Japon Pop",
	}

	question := nextCaptureQuestion(bot, lead, &domain.Conversation{})
	if !strings.Contains(strings.ToLower(question), "fecha tentativa") && !strings.Contains(strings.ToLower(question), "mes aproximado") {
		t.Fatalf("expected travel date question first after email, got %q", question)
	}

	lead.TravelDate = "noviembre 2026"
	question = nextCaptureQuestion(bot, lead, &domain.Conversation{})
	if !strings.Contains(strings.ToLower(question), "cuantas personas") {
		t.Fatalf("expected travelers question after travel date, got %q", question)
	}
}

func TestNextCaptureQuestionSkipsEmailWhenRefused(t *testing.T) {
	bot := domain.BotKnowledge{}
	lead := &domain.Lead{
		Name:  "Andrea",
		Phone: "+525511112222",
	}
	conversation := &domain.Conversation{
		Metadata: map[string]any{
			"email_refused": true,
		},
	}

	question := nextCaptureQuestion(bot, lead, conversation)
	lower := strings.ToLower(question)

	if strings.Contains(lower, "correo") {
		t.Fatalf("expected email to be skipped after explicit refusal, got %q", question)
	}
	if !strings.Contains(lower, "fecha tentativa") && !strings.Contains(lower, "mes aproximado") {
		t.Fatalf("expected next step to move to travel date after email refusal, got %q", question)
	}
}

func TestExtractLeadSignalsCapturesNewTravelFields(t *testing.T) {
	service := &Service{}
	lead := &domain.Lead{}
	conversation := &domain.Conversation{Stage: domain.StageQualify}

	now := time.Date(2026, time.June, 23, 12, 0, 0, 0, time.UTC)

	updated, _ := service.extractLeadSignals(context.Background(), domain.BotKnowledge{}, lead, "somos 4 personas", conversation, now)
	if updated.Travelers != "4" {
		t.Fatalf("expected travelers to be captured, got %q", updated.Travelers)
	}

	updated, _ = service.extractLeadSignals(context.Background(), domain.BotKnowledge{}, updated, "nos gustaria viajar en noviembre de 2026", conversation, now)
	if updated.TravelDate != "2026-11-01" {
		t.Fatalf("expected travel date to be captured as ISO, got %q", updated.TravelDate)
	}

	updated, _ = service.extractLeadSignals(context.Background(), domain.BotKnowledge{}, updated, "es por nuestro aniversario", conversation, now)
	if updated.SpecialOccasion != "es por nuestro aniversario" {
		t.Fatalf("expected special occasion to be captured, got %q", updated.SpecialOccasion)
	}

	updated, _ = service.extractLeadSignals(context.Background(), domain.BotKnowledge{}, updated, "me pueden llamar por la tarde", conversation, now)
	if updated.PreferredContactTime != "me pueden llamar por la tarde" {
		t.Fatalf("expected contact time to be captured, got %q", updated.PreferredContactTime)
	}
}

func TestExtractLeadSignalsCapturesTravelerCountFromLeadingNumberAndCompanions(t *testing.T) {
	service := &Service{}
	lead := &domain.Lead{}
	conversation := &domain.Conversation{Stage: domain.StageQualify}
	now := time.Date(2026, time.June, 23, 12, 0, 0, 0, time.UTC)

	updated, _ := service.extractLeadSignals(context.Background(), domain.BotKnowledge{}, lead, "2, mi hermano y yo", conversation, now)
	if updated.Travelers != "2" {
		t.Fatalf("expected leading traveler count to normalize to 2, got %q", updated.Travelers)
	}

	updated, _ = service.extractLeadSignals(context.Background(), domain.BotKnowledge{}, updated, "mi hermano y yo", conversation, now)
	if updated.Travelers != "2" {
		t.Fatalf("expected companion phrase to normalize to 2, got %q", updated.Travelers)
	}
}

func TestExtractLeadSignalsCapturesNegativeSpecialOccasionAsNone(t *testing.T) {
	service := &Service{}
	lead := &domain.Lead{}
	conversation := &domain.Conversation{Stage: domain.StageQualify}
	now := time.Date(2026, time.June, 23, 12, 0, 0, 0, time.UTC)

	updated, _ := service.extractLeadSignals(context.Background(), domain.BotKnowledge{}, lead, "no en especial, solo conocer y disfrutar con mi hermano mas pequeno", conversation, now)
	if updated.SpecialOccasion != "Sin motivo especial" {
		t.Fatalf("expected negative special occasion to normalize to Sin motivo especial, got %q", updated.SpecialOccasion)
	}
}

func TestExtractLeadSignalsNormalizesPreferredContactTime(t *testing.T) {
	service := &Service{}
	lead := &domain.Lead{}
	conversation := &domain.Conversation{Stage: domain.StageQualify}
	now := time.Date(2026, time.June, 23, 12, 0, 0, 0, time.UTC)

	updated, _ := service.extractLeadSignals(context.Background(), domain.BotKnowledge{}, lead, "despues de las 9", conversation, now)
	if updated.PreferredContactTime != "despues de las 09:00" {
		t.Fatalf("expected preferred contact time to normalize, got %q", updated.PreferredContactTime)
	}
}

func TestExtractLeadSignalsCapturesMonthOnlyTravelDate(t *testing.T) {
	service := &Service{}
	lead := &domain.Lead{}
	conversation := &domain.Conversation{Stage: domain.StageQualify}
	now := time.Date(2026, time.June, 23, 12, 0, 0, 0, time.UTC)
	message := "estoy pensando que sea para septiembre"

	if direct := detectTravelDate(message, now); direct == "" {
		t.Fatalf("expected direct travel date detection to capture month-only input")
	}

	updated, _ := service.extractLeadSignals(context.Background(), domain.BotKnowledge{}, lead, message, conversation, now)

	if updated.TravelDate != "2026-09-01" {
		t.Fatalf("expected month-only travel date to normalize to ISO, got %q", updated.TravelDate)
	}
}

func TestExtractLeadSignalsCapturesSplitSpecialOccasionAndTime(t *testing.T) {
	service := &Service{}
	lead := &domain.Lead{}
	conversation := &domain.Conversation{Stage: domain.StageQualify}
	now := time.Date(2026, time.June, 23, 12, 0, 0, 0, time.UTC)

	updated, _ := service.extractLeadSignals(context.Background(), domain.BotKnowledge{}, lead, "c umple", conversation, now)
	if updated.SpecialOccasion == "" {
		t.Fatalf("expected split special occasion phrase to be captured, got %q", updated.SpecialOccasion)
	}

	updated, _ = service.extractLeadSignals(context.Background(), domain.BotKnowledge{}, updated, "a las 6", conversation, now)
	if updated.PreferredContactTime == "" {
		t.Fatalf("expected loose preferred contact time to be captured, got %q", updated.PreferredContactTime)
	}
}

func TestExtractLeadSignalsMarksEmailRefusal(t *testing.T) {
	service := &Service{}
	lead := &domain.Lead{
		Name: "Marta",
	}
	conversation := &domain.Conversation{Stage: domain.StageQualify}
	now := time.Date(2026, time.June, 23, 12, 0, 0, 0, time.UTC)

	_, signal := service.extractLeadSignals(context.Background(), domain.BotKnowledge{}, lead, "no tengo correo", conversation, now)

	if value, ok := signal.Details["email_refused"].(bool); !ok || !value {
		t.Fatalf("expected email refusal signal to be marked, got %#v", signal.Details["email_refused"])
	}
}

func TestExtractLeadSignalsCapturesSoloTravelerAsOne(t *testing.T) {
	service := &Service{}
	lead := &domain.Lead{}
	conversation := &domain.Conversation{Stage: domain.StageQualify}

	updated, _ := service.extractLeadSignals(context.Background(), domain.BotKnowledge{}, lead, "viajo solo", conversation, time.Date(2026, time.June, 23, 12, 0, 0, 0, time.UTC))
	if updated.Travelers != "1" {
		t.Fatalf("expected solo traveler to normalize to 1, got %q", updated.Travelers)
	}
}

func TestExtractLeadSignalsCapturesSeremosTravelerCount(t *testing.T) {
	service := &Service{}
	lead := &domain.Lead{}
	conversation := &domain.Conversation{Stage: domain.StageQualify}

	updated, _ := service.extractLeadSignals(context.Background(), domain.BotKnowledge{}, lead, "seremos 5 personas", conversation, time.Date(2026, time.June, 23, 12, 0, 0, 0, time.UTC))
	if updated.Travelers != "5" {
		t.Fatalf("expected seremos traveler phrase to be captured, got %q", updated.Travelers)
	}
}

func TestExtractLeadSignalsCapturesCompanionListTravelerCount(t *testing.T) {
	service := &Service{}
	lead := &domain.Lead{}
	conversation := &domain.Conversation{Stage: domain.StageQualify}

	updated, _ := service.extractLeadSignals(context.Background(), domain.BotKnowledge{}, lead, "Seremos mi hermana, mi mama y yo", conversation, time.Date(2026, time.June, 23, 12, 0, 0, 0, time.UTC))
	if updated.Travelers != "3" {
		t.Fatalf("expected companion list to normalize to 3, got %q", updated.Travelers)
	}
}

func TestExtractLeadSignalsCapturesTravelersFromMixedPricingMessage(t *testing.T) {
	service := &Service{}
	lead := &domain.Lead{}
	conversation := &domain.Conversation{Stage: domain.StageQualify}

	updated, _ := service.extractLeadSignals(context.Background(), domain.BotKnowledge{}, lead, "Quiero saber los costos, seremos 6 personas", conversation, time.Date(2026, time.June, 23, 12, 0, 0, 0, time.UTC))
	if updated.Travelers != "6" {
		t.Fatalf("expected mixed pricing message to normalize traveler count to 6, got %q", updated.Travelers)
	}
}

func TestExtractLeadSignalsUsesConfiguredHandoffTriggers(t *testing.T) {
	service := &Service{}
	bot := domain.BotKnowledge{
		Handoff: domain.HandoffRule{
			Triggers: []string{"viaje vip"},
		},
	}
	lead := &domain.Lead{}

	_, signal := service.extractLeadSignals(context.Background(), bot, lead, "me interesa un viaje vip", &domain.Conversation{}, time.Date(2026, time.June, 23, 12, 0, 0, 0, time.UTC))

	if signal.EventType != "handoff_intent_detected" {
		t.Fatalf("expected handoff trigger to set handoff event, got %q", signal.EventType)
	}
	if value, ok := signal.Details["handoff_intent"].(bool); !ok || !value {
		t.Fatalf("expected handoff intent detail to be set, got %#v", signal.Details["handoff_intent"])
	}
}

func TestExtractLeadSignalsTreatsHomeDestinationAsInterestNotName(t *testing.T) {
	service := &Service{}
	bot := domain.BotKnowledge{Slug: "home"}
	lead := &domain.Lead{}
	conversation := &domain.Conversation{Stage: domain.StageQualify}

	updated, _ := service.extractLeadSignals(
		context.Background(),
		bot,
		lead,
		"Puerto Vallarta",
		conversation,
		time.Date(2026, time.June, 23, 12, 0, 0, 0, time.UTC),
	)

	if updated.Name != "" {
		t.Fatalf("expected unsupported destination to stay out of the name field, got %q", updated.Name)
	}
	if updated.Interest != "" {
		t.Fatalf("expected unsupported destination to stay out of interest, got %q", updated.Interest)
	}
}

func TestExtractLeadSignalsCapturesSupportedHomeDestinationAsInterest(t *testing.T) {
	service := &Service{}
	bot := domain.BotKnowledge{Slug: "home"}
	lead := &domain.Lead{}
	conversation := &domain.Conversation{Stage: domain.StageQualify}

	updated, _ := service.extractLeadSignals(
		context.Background(),
		bot,
		lead,
		"Me interesa conocer Alemania",
		conversation,
		time.Date(2026, time.June, 23, 12, 0, 0, 0, time.UTC),
	)

	if updated.Interest != "Europa" {
		t.Fatalf("expected supported destination alias to resolve to Europa, got %q", updated.Interest)
	}
}

func TestGenerateResponseBypassesLLMForUnsupportedHomeDestination(t *testing.T) {
	llm := &fakeLLMClient{
		enabled: true,
		response: LLMResponse{
			Text:   "No deberia usarse",
			Source: "llm",
		},
	}
	service := &Service{
		llm:   llm,
		clock: fixedClock{now: time.Date(2026, time.June, 23, 12, 0, 0, 0, time.UTC)},
	}
	bot := domain.BotKnowledge{Slug: "home"}

	reply, source, err := service.generateResponse(
		context.Background(),
		bot,
		&domain.Conversation{},
		&domain.Lead{},
		nil,
		"Puerto Vallarta",
		HandoffDecision{},
	)
	if err != nil {
		t.Fatalf("expected unsupported destination response to succeed, got error: %v", err)
	}
	if len(llm.calls) != 0 {
		t.Fatalf("expected unsupported destination to bypass the LLM, got %d calls", len(llm.calls))
	}
	lower := strings.ToLower(reply)
	if !strings.Contains(lower, "no manejamos ese destino") {
		t.Fatalf("expected unsupported destination guidance, got %q", reply)
	}
	if source != "rules_fallback" {
		t.Fatalf("expected rules_fallback source, got %q", source)
	}
}

func TestBuildPromptIncludesConfiguredKnowledgeSections(t *testing.T) {
	bot := domain.BotKnowledge{
		Slug:                   "japon-premium",
		BrandName:              "Japon Premium",
		DisplayName:            "Japon PREMIUM",
		PagePrincipalHint:      "Cuando llegue desde la pagina principal, identifica si busca Japon o un destino alterno.",
		LeadCapture:            []string{"name", "email", "phone", "interest"},
		Keywords:               []string{"japon premium", "japon"},
		DestinationKeywords:    []string{"japon", "tokio"},
		QualificationQuestions: []string{"Me comparte su nombre?"},
		ClosingPrompts:         []string{"Con gusto le preparo un siguiente paso."},
		Handoff: domain.HandoffRule{
			Triggers:       []string{"cotizacion", "asesor"},
			ThresholdScore: 70,
			Reason:         "Seguimiento premium",
			ClosingMessage: "Un asesor le dara seguimiento.",
		},
	}
	conversation := &domain.Conversation{Stage: domain.StageDiscover}
	lead := &domain.Lead{}
	now := time.Date(2026, time.June, 18, 12, 0, 0, 0, time.UTC)

	prompt := BuildPrompt(bot, conversation, lead, nil, "hola", "Me comparte su nombre?", 70, now)

	if !strings.Contains(prompt.SystemPrompt, "Campos de captura configurados en conocimiento") {
		t.Fatalf("expected capture config to be present in prompt, got %q", prompt.SystemPrompt)
	}
	if !strings.Contains(prompt.SystemPrompt, "## Palabras Clave") {
		t.Fatalf("expected keyword section in prompt, got %q", prompt.SystemPrompt)
	}
	if !strings.Contains(prompt.SystemPrompt, "## Handoff") {
		t.Fatalf("expected handoff section in prompt, got %q", prompt.SystemPrompt)
	}
	if !strings.Contains(prompt.SystemPrompt, "Hint de pagina principal") {
		t.Fatalf("expected principal page hint in prompt, got %q", prompt.SystemPrompt)
	}
}

func TestShouldHandoffWaitsForTravelQualification(t *testing.T) {
	service := &Service{handoffThreshold: 70}
	bot := domain.BotKnowledge{
		Handoff: domain.HandoffRule{Reason: "Seguimiento premium"},
	}
	lead := &domain.Lead{
		Name:     "Luis",
		Email:    "luis@example.com",
		Phone:    "+525511112222",
		Interest: "Japon Pop",
	}

	score := service.computeScore(bot, lead, &domain.Conversation{}, "quiero hablar con un asesor")
	stage := service.computeStage(score, lead, LeadSignal{EventType: "handoff_intent_detected"})
	handoff := service.shouldHandoff(bot, score, stage, LeadSignal{EventType: "handoff_intent_detected"}, lead)

	if handoff.Required {
		t.Fatalf("expected handoff to wait for travel qualification, got %#v", handoff)
	}

	lead.Travelers = "2 personas"
	lead.TravelDate = "noviembre 2026"
	lead.SpecialOccasion = "Sin motivo especial"
	lead.PreferredContactTime = "por la tarde"

	score = service.computeScore(bot, lead, &domain.Conversation{}, "quiero hablar con un asesor")
	stage = service.computeStage(score, lead, LeadSignal{EventType: "handoff_intent_detected"})
	handoff = service.shouldHandoff(bot, score, stage, LeadSignal{EventType: "handoff_intent_detected"}, lead)

	if !handoff.Required {
		t.Fatalf("expected handoff after full qualification, got %#v", handoff)
	}
}

func TestComputeStageWaitsForFullQualificationBeforeConvert(t *testing.T) {
	service := &Service{handoffThreshold: 70}
	lead := &domain.Lead{
		Name:                 "Edgar",
		Phone:                "5548158131",
		Email:                "calidad@viajespremium.com.mx",
		Interest:             "Japon Pop",
		TravelDate:           "2026-12-01",
		PreferredContactTime: "despues de las 09:00",
	}

	stage := service.computeStage(55, lead, LeadSignal{})
	if stage != domain.StageQualify {
		t.Fatalf("expected incomplete lead to stay in qualify, got %s", stage)
	}

	lead.Travelers = "2"
	lead.SpecialOccasion = "Sin motivo especial"

	stage = service.computeStage(65, lead, LeadSignal{})
	if stage != domain.StageConvert {
		t.Fatalf("expected fully qualified lead to convert, got %s", stage)
	}
}
