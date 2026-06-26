package application

import (
	"context"
	"fmt"
	"html"
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
	botLabel := firstNonEmpty(bot.DisplayName, bot.BrandName, conversation.LandingSlug, lead.BotSlug, "Bot")
	subject := leadmail.BuildNotificationSubject(
		leadmail.NormalizeLandingSubjectLabel(firstNonEmpty(conversation.LandingSlug, lead.LandingSlug)),
		"Bot con IA",
	)
	leadName := firstNonEmpty(lead.Name, "No especificado")
	landingURL := firstNonEmpty(conversation.LandingURL, "No especificado")
	landingSlug := firstNonEmpty(conversation.LandingSlug, lead.LandingSlug, "No especificado")
	bodyLines := []string{
		"Disparo automatico por 1 minuto de inactividad del cliente.",
		"",
		"Datos del lead:",
	}
	bodyLines = appendBotLineIfValue(bodyLines, "Bot", botLabel)
	bodyLines = appendBotLineIfValue(bodyLines, "Landing URL", landingURL)
	bodyLines = appendBotLineIfValue(bodyLines, "Landing slug", landingSlug)
	bodyLines = appendBotLineIfValue(bodyLines, "Nombre", leadName)
	bodyLines = appendBotLineIfValue(bodyLines, "Telefono", lead.Phone)
	bodyLines = appendBotLineIfValue(bodyLines, "Correo", lead.Email)
	bodyLines = appendBotLineIfValue(bodyLines, "Interes", lead.Interest)
	bodyLines = appendBotLineIfValue(bodyLines, "Viajeros", lead.Travelers)
	bodyLines = appendBotLineIfValue(bodyLines, "Fecha tentativa", lead.TravelDate)
	if strings.TrimSpace(lead.TravelDate) != "" {
		bodyLines = appendBotLineIfValue(bodyLines, "Prioridad", lead.Priority)
	}
	bodyLines = appendBotLineIfValue(bodyLines, "Motivo especial", lead.SpecialOccasion)
	bodyLines = appendBotLineIfValue(bodyLines, "Mejor horario", lead.PreferredContactTime)
	bodyLines = appendBotLineIfValue(bodyLines, "Stage", string(lead.Stage))
	bodyLines = appendBotAttributionLines(bodyLines, lead.Attribution)
	bodyLines = append(bodyLines, "", "Conversacion completa:")
	bodyLines = append(bodyLines, buildBotTranscriptText(messages, now))

	return leadmail.EmailMessage{
		ReplyTo:  lead.Email,
		Subject:  subject,
		TextBody: strings.Join(bodyLines, "\n"),
		HTMLBody: buildBotTranscriptHTML(botLabel, conversation, lead, messages, now),
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
	var b strings.Builder
	b.WriteString(fmt.Sprintf("<h2>Nuevo Lead - %s</h2>", escapeBotHTML(botLabel)))
	b.WriteString("<p>Disparo automatico por 1 minuto de inactividad del cliente.</p>")
	b.WriteString("<table border=\"1\" cellpadding=\"8\" cellspacing=\"0\" style=\"border-collapse:collapse;margin-bottom:16px;\">")
	writeBotHTMLRow(&b, "Landing URL", firstNonEmpty(conversation.LandingURL, "No especificado"))
	writeBotHTMLRow(&b, "Landing slug", firstNonEmpty(conversation.LandingSlug, lead.LandingSlug, "No especificado"))
	writeBotHTMLRow(&b, "Nombre", firstNonEmpty(lead.Name, "No especificado"))
	writeBotHTMLRow(&b, "Telefono", firstNonEmpty(lead.Phone, "No especificado"))
	writeBotHTMLRow(&b, "Correo", firstNonEmpty(lead.Email, "No especificado"))
	writeBotHTMLRow(&b, "Interes", firstNonEmpty(lead.Interest, "No especificado"))
	writeBotHTMLRow(&b, "Viajeros", firstNonEmpty(lead.Travelers, "No especificado"))
	writeBotHTMLRow(&b, "Fecha tentativa", firstNonEmpty(lead.TravelDate, "No especificado"))
	writeBotHTMLRow(&b, "Motivo especial", firstNonEmpty(lead.SpecialOccasion, "No especificado"))
	writeBotHTMLRow(&b, "Mejor horario", firstNonEmpty(lead.PreferredContactTime, "No especificado"))
	writeBotHTMLRow(&b, "Stage", string(lead.Stage))
	writeBotAttributionHTML(&b, lead.Attribution)
	b.WriteString("</table>")

	b.WriteString("<h3>Conversacion completa</h3>")
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
