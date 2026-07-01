package application

import (
	"context"
	"fmt"
	"html"
	"sort"
	"strings"
	"time"

	"backend/internal/chat/domain"
	leadmail "backend/internal/leads/application"
)

const botLeadEmailDelay = 1 * time.Minute

// LeadEmailSender sends the bot lead email through the shared SMTP pipeline.
type LeadEmailSender interface {
	SendLeadEmail(ctx context.Context, message leadmail.EmailMessage) (string, error)
}

func (s *Service) scheduleBotLeadEmail(lead *domain.Lead, now time.Time) {
	if s != nil && s.disableLeadEmails {
		return
	}
	if lead == nil || !lead.BotEmailSentAt.IsZero() {
		return
	}
	if !hasBotEmailMinimumContactData(lead) {
		return
	}
	lead.BotEmailDueAt = now.UTC().Add(botLeadEmailDelay)
}

func hasBotEmailMinimumContactData(lead *domain.Lead) bool {
	return lead != nil &&
		strings.TrimSpace(lead.Name) != "" &&
		strings.TrimSpace(lead.Phone) != ""
}

func (s *Service) ProcessPendingBotLeadEmails(ctx context.Context, limit int) (int, error) {
	if s == nil || s.disableLeadEmails || s.leadEmailSender == nil {
		return 0, nil
	}
	if limit <= 0 {
		limit = 20
	}

	now := s.clock.Now().UTC()
	candidates, err := s.leads.ListPendingBotEmails(ctx, now, limit)
	if err != nil {
		return 0, err
	}

	processed := 0
	for _, candidate := range candidates {
		if candidate == nil {
			continue
		}

		lead, err := s.leads.FindByConversation(ctx, candidate.ConversationID)
		if err != nil {
			return processed, err
		}
		if lead == nil || lead.BotEmailDueAt.IsZero() || !lead.BotEmailSentAt.IsZero() || lead.BotEmailDueAt.After(now) {
			continue
		}
		if !hasBotEmailMinimumContactData(lead) {
			continue
		}

		conversation, err := s.conversations.FindByID(ctx, lead.ConversationID)
		if err != nil {
			return processed, err
		}
		if conversation == nil {
			continue
		}

		messages, err := s.messages.ListByConversation(ctx, conversation.ID)
		if err != nil {
			return processed, err
		}

		bot, err := s.knowledge.Get(ctx, lead.BotSlug)
		if err != nil {
			return processed, err
		}

		message := buildBotLeadEmailMessage(bot, conversation, lead, messages, now)
		messageID, err := s.leadEmailSender.SendLeadEmail(ctx, message)
		if err != nil {
			return processed, err
		}

		lead.BotEmailSentAt = now
		lead.BotEmailDueAt = time.Time{}
		lead.BotEmailMessageID = messageID
		if err := s.leads.Update(ctx, lead); err != nil {
			return processed, err
		}

		processed++
	}

	return processed, nil
}

func buildBotLeadEmailMessage(bot domain.BotKnowledge, conversation *domain.Conversation, lead *domain.Lead, messages []domain.Message, now time.Time) leadmail.EmailMessage {
	orderedMessages := orderedTranscriptMessages(messages)
	botLabel := firstNonEmpty(bot.DisplayName, bot.BrandName, conversation.LandingSlug, lead.BotSlug, "Bot")
	subject := leadmail.BuildNotificationSubject(
		leadmail.NormalizeLandingSubjectLabel(firstNonEmpty(conversation.LandingSlug, lead.LandingSlug)),
		"Bot con IA",
	)
	leadName := firstNonEmpty(lead.Name, "No especificado")
	landingURL := firstNonEmpty(conversation.LandingURL, "No especificado")
	landingSlug := firstNonEmpty(conversation.LandingSlug, lead.LandingSlug, "No especificado")
	priority := strings.TrimSpace(lead.Priority)
	if priority == "" {
		priority = leadmail.DerivePriorityFromTravelDate(lead.TravelDate, now)
	}
	if priority == "" {
		priority = "normal"
	}
	bodyLines := []string{
		"Disparo automatico por 1 minuto de inactividad del cliente.",
		"",
		formatBotLine("Email", firstNonEmpty(lead.Email, "No especificado")),
		formatBotLine("Teléfono", firstNonEmpty(lead.Phone, "No especificado")),
		formatBotLine("Prioridad", priority),
		formatBotLine("Origen", botLabel),
		formatBotLine("Página de conversión", landingURL),
		formatBotLine("Landing slug", landingSlug),
		formatBotLine("Nombre", leadName),
	}
	bodyLines = appendBotLineIfValue(bodyLines, "Interés", lead.Interest)
	bodyLines = appendBotLineIfValue(bodyLines, "Viajeros", lead.Travelers)
	bodyLines = appendBotLineIfValue(bodyLines, "Fecha tentativa", lead.TravelDate)
	bodyLines = appendBotLineIfValue(bodyLines, "Motivo especial", lead.SpecialOccasion)
	bodyLines = appendBotLineIfValue(bodyLines, "Mejor horario", lead.PreferredContactTime)
	bodyLines = appendBotLineIfValue(bodyLines, "Stage", string(lead.Stage))
	bodyLines = appendBotAttributionLines(bodyLines, lead.Attribution)
	bodyLines = append(bodyLines, "", "Conversación:")
	bodyLines = append(bodyLines, buildBotTranscriptText(orderedMessages, now))

	return leadmail.EmailMessage{
		ReplyTo:  lead.Email,
		Subject:  subject,
		TextBody: strings.Join(bodyLines, "\n"),
		HTMLBody: buildBotTranscriptHTML(botLabel, conversation, lead, orderedMessages, now),
	}
}

func buildBotTranscriptText(messages []domain.Message, now time.Time) string {
	if len(messages) == 0 {
		return "Sin mensajes registrados."
	}

	lines := make([]string, 0, len(messages))
	for _, message := range messages {
		label, ok := messageTranscriptLabel(message.Role)
		if !ok {
			continue
		}
		content := strings.TrimSpace(message.Content)
		if content == "" {
			continue
		}
		lines = append(lines, fmt.Sprintf("%s: %s", label, content), "")
	}
	return strings.TrimSpace(strings.Join(lines, "\n"))
}

func buildBotTranscriptHTML(botLabel string, conversation *domain.Conversation, lead *domain.Lead, messages []domain.Message, now time.Time) string {
	priority := strings.TrimSpace(lead.Priority)
	if priority == "" {
		priority = leadmail.DerivePriorityFromTravelDate(lead.TravelDate, now)
	}
	if priority == "" {
		priority = "normal"
	}

	var b strings.Builder
	b.WriteString(fmt.Sprintf("<h2>Nuevo Lead - %s</h2>", escapeBotHTML(botLabel)))
	b.WriteString("<p><strong>Disparo automatico por 1 minuto de inactividad del cliente.</strong></p>")
	b.WriteString("<p>")
	b.WriteString("<strong>Email:</strong> ")
	b.WriteString(escapeBotHTML(firstNonEmpty(lead.Email, "No especificado")))
	b.WriteString("<br><strong>Teléfono:</strong> ")
	b.WriteString(escapeBotHTML(firstNonEmpty(lead.Phone, "No especificado")))
	b.WriteString("<br><strong>Prioridad:</strong> ")
	b.WriteString(escapeBotHTML(priority))
	b.WriteString("<br><strong>Origen:</strong> ")
	b.WriteString(escapeBotHTML(botLabel))
	b.WriteString("<br><strong>Página de conversión:</strong> ")
	b.WriteString(escapeBotHTML(firstNonEmpty(conversation.LandingURL, "No especificado")))
	b.WriteString("<br><strong>Landing slug:</strong> ")
	b.WriteString(escapeBotHTML(firstNonEmpty(conversation.LandingSlug, lead.LandingSlug, "No especificado")))
	b.WriteString("<br><strong>Nombre:</strong> ")
	b.WriteString(escapeBotHTML(firstNonEmpty(lead.Name, "No especificado")))
	b.WriteString("<br><strong>Interés:</strong> ")
	b.WriteString(escapeBotHTML(firstNonEmpty(lead.Interest, "No especificado")))
	b.WriteString("<br><strong>Viajeros:</strong> ")
	b.WriteString(escapeBotHTML(firstNonEmpty(lead.Travelers, "No especificado")))
	b.WriteString("<br><strong>Fecha tentativa:</strong> ")
	b.WriteString(escapeBotHTML(firstNonEmpty(lead.TravelDate, "No especificado")))
	b.WriteString("<br><strong>Motivo especial:</strong> ")
	b.WriteString(escapeBotHTML(firstNonEmpty(lead.SpecialOccasion, "No especificado")))
	b.WriteString("<br><strong>Mejor horario:</strong> ")
	b.WriteString(escapeBotHTML(firstNonEmpty(lead.PreferredContactTime, "No especificado")))
	b.WriteString("<br><strong>Stage:</strong> ")
	b.WriteString(escapeBotHTML(string(lead.Stage)))
	b.WriteString("</p>")
	writeBotAttributionHTMLBlock(&b, lead.Attribution)

	b.WriteString("<p><strong>Conversación:</strong></p>")
	if len(messages) == 0 {
		b.WriteString("<p>Sin mensajes registrados.</p>")
		return b.String()
	}

	b.WriteString("<div style=\"display:flex;flex-direction:column;gap:10px;\">")
	for _, message := range messages {
		label, ok := messageTranscriptLabel(message.Role)
		if !ok {
			continue
		}
		content := strings.TrimSpace(message.Content)
		if content == "" {
			continue
		}
		b.WriteString("<div style=\"white-space:pre-wrap;\">")
		b.WriteString("<strong>")
		b.WriteString(escapeBotHTML(label))
		b.WriteString(":</strong> ")
		b.WriteString(escapeBotHTML(content))
		b.WriteString("</div>")
	}
	b.WriteString("</div>")

	return b.String()
}

func orderedTranscriptMessages(messages []domain.Message) []domain.Message {
	if len(messages) == 0 {
		return nil
	}

	ordered := append([]domain.Message(nil), messages...)
	sort.SliceStable(ordered, func(i, j int) bool {
		left := ordered[i]
		right := ordered[j]

		if !left.CreatedAt.Equal(right.CreatedAt) {
			return left.CreatedAt.Before(right.CreatedAt)
		}

		leftRank := transcriptRoleRank(left.Role)
		rightRank := transcriptRoleRank(right.Role)
		if leftRank != rightRank {
			return leftRank < rightRank
		}

		return left.ID < right.ID
	})

	return ordered
}

func transcriptRoleRank(role domain.Role) int {
	switch role {
	case domain.RoleUser:
		return 0
	case domain.RoleAssistant:
		return 1
	case domain.RoleSystem:
		return 2
	default:
		return 3
	}
}

func writeBotHTMLRow(builder *strings.Builder, label, value string) {
	builder.WriteString("<tr><th align=\"left\">")
	builder.WriteString(escapeBotHTML(label))
	builder.WriteString(":</th><td>")
	builder.WriteString(escapeBotHTML(value))
	builder.WriteString("</td></tr>")
}

func messageRoleLabel(role domain.Role) string {
	switch role {
	case domain.RoleAssistant:
		return "Bot"
	case domain.RoleSystem:
		return "Sistema"
	default:
		return "Cliente"
	}
}

func messageTranscriptLabel(role domain.Role) (string, bool) {
	switch role {
	case domain.RoleAssistant:
		return "bot", true
	case domain.RoleUser:
		return "cliente", true
	default:
		return "", false
	}
}

func formatBotTimestamp(value, now time.Time) string {
	location := mexicoCityLocation()
	if value.IsZero() {
		return now.In(location).Format("02/01/2006 15:04:05")
	}
	return value.In(location).Format("02/01/2006 15:04:05")
}

func formatBotLine(label, value string) string {
	if strings.TrimSpace(value) == "" {
		value = "No especificado"
	}
	return fmt.Sprintf("%s: %s", label, value)
}

func appendBotLineIfValue(lines []string, label, value string) []string {
	if strings.TrimSpace(value) == "" {
		return lines
	}
	return append(lines, formatBotLine(label, value))
}

func writeBotAttributionHTMLBlock(builder *strings.Builder, attribution domain.Attribution) {
	if !hasBotAttribution(attribution) {
		return
	}

	builder.WriteString("<p><strong>Atribución:</strong><br>")
	builder.WriteString("<strong>UTM Source:</strong> ")
	builder.WriteString(escapeBotHTML(firstNonEmpty(attribution.UTMSource, "No especificado")))
	builder.WriteString("<br><strong>UTM Medium:</strong> ")
	builder.WriteString(escapeBotHTML(firstNonEmpty(attribution.UTMMedium, "No especificado")))
	builder.WriteString("<br><strong>UTM Campaign:</strong> ")
	builder.WriteString(escapeBotHTML(firstNonEmpty(attribution.UTMCampaign, "No especificado")))
	builder.WriteString("<br><strong>UTM Content:</strong> ")
	builder.WriteString(escapeBotHTML(firstNonEmpty(attribution.UTMContent, "No especificado")))
	builder.WriteString("<br><strong>UTM Term:</strong> ")
	builder.WriteString(escapeBotHTML(firstNonEmpty(attribution.UTMTerm, "No especificado")))
	builder.WriteString("<br><strong>FBCLID:</strong> ")
	builder.WriteString(escapeBotHTML(firstNonEmpty(attribution.FBCLID, "No especificado")))
	builder.WriteString("<br><strong>Referrer:</strong> ")
	builder.WriteString(escapeBotHTML(firstNonEmpty(attribution.Referrer, "No especificado")))
	builder.WriteString("<br><strong>Landing slug:</strong> ")
	builder.WriteString(escapeBotHTML(firstNonEmpty(attribution.LandingSlug, "No especificado")))
	builder.WriteString("<br><strong>Destino:</strong> ")
	builder.WriteString(escapeBotHTML(firstNonEmpty(attribution.Destination, "No especificado")))
	builder.WriteString("<br><strong>Page path:</strong> ")
	builder.WriteString(escapeBotHTML(firstNonEmpty(attribution.PagePath, "No especificado")))
	builder.WriteString("</p>")
}

func appendBotAttributionLines(lines []string, attribution domain.Attribution) []string {
	if !hasBotAttribution(attribution) {
		return lines
	}

	lines = append(lines, "", "Atribución:")
	lines = appendBotLineIfValue(lines, "UTM Source", attribution.UTMSource)
	lines = appendBotLineIfValue(lines, "UTM Medium", attribution.UTMMedium)
	lines = appendBotLineIfValue(lines, "UTM Campaign", attribution.UTMCampaign)
	lines = appendBotLineIfValue(lines, "UTM Content", attribution.UTMContent)
	lines = appendBotLineIfValue(lines, "UTM Term", attribution.UTMTerm)
	lines = appendBotLineIfValue(lines, "FBCLID", attribution.FBCLID)
	lines = appendBotLineIfValue(lines, "Referrer", attribution.Referrer)
	lines = appendBotLineIfValue(lines, "Landing slug", attribution.LandingSlug)
	lines = appendBotLineIfValue(lines, "Destino", attribution.Destination)
	lines = appendBotLineIfValue(lines, "Page path", attribution.PagePath)
	return lines
}

func writeBotAttributionHTML(builder *strings.Builder, attribution domain.Attribution) {
	if !hasBotAttribution(attribution) {
		return
	}

	builder.WriteString("<tr><th colspan=\"2\" align=\"left\">Atribución</th></tr>")
	writeBotHTMLRow(builder, "UTM Source", firstNonEmpty(attribution.UTMSource, "No especificado"))
	writeBotHTMLRow(builder, "UTM Medium", firstNonEmpty(attribution.UTMMedium, "No especificado"))
	writeBotHTMLRow(builder, "UTM Campaign", firstNonEmpty(attribution.UTMCampaign, "No especificado"))
	writeBotHTMLRow(builder, "UTM Content", firstNonEmpty(attribution.UTMContent, "No especificado"))
	writeBotHTMLRow(builder, "UTM Term", firstNonEmpty(attribution.UTMTerm, "No especificado"))
	writeBotHTMLRow(builder, "FBCLID", firstNonEmpty(attribution.FBCLID, "No especificado"))
	writeBotHTMLRow(builder, "Referrer", firstNonEmpty(attribution.Referrer, "No especificado"))
	writeBotHTMLRow(builder, "Landing slug", firstNonEmpty(attribution.LandingSlug, "No especificado"))
	writeBotHTMLRow(builder, "Destino", firstNonEmpty(attribution.Destination, "No especificado"))
	writeBotHTMLRow(builder, "Page path", firstNonEmpty(attribution.PagePath, "No especificado"))
}

func hasBotAttribution(attribution domain.Attribution) bool {
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

func escapeBotHTML(value string) string {
	return html.EscapeString(value)
}

func mexicoCityLocation() *time.Location {
	location, err := time.LoadLocation("America/Mexico_City")
	if err != nil {
		return time.FixedZone("CST", -6*60*60)
	}
	return location
}
