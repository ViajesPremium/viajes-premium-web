package application

import (
	"fmt"
	"strings"

	"backend/internal/chat/domain"
)

type captureField string

const (
	captureFieldName                 captureField = "name"
	captureFieldPhone                captureField = "phone"
	captureFieldEmail                captureField = "email"
	captureFieldInterest             captureField = "interest"
	captureFieldTravelers            captureField = "travelers"
	captureFieldTravelDate           captureField = "travel_date"
	captureFieldSpecialOccasion      captureField = "special_occasion"
	captureFieldPreferredContactTime captureField = "preferred_contact_time"
)

var canonicalCaptureOrder = []captureField{
	captureFieldName,
	captureFieldPhone,
	captureFieldEmail,
	captureFieldTravelDate,
	captureFieldInterest,
	captureFieldTravelers,
	captureFieldSpecialOccasion,
	captureFieldPreferredContactTime,
}

func captureFieldLabel(field captureField) string {
	switch field {
	case captureFieldName:
		return "nombre"
	case captureFieldPhone:
		return "telefono"
	case captureFieldEmail:
		return "correo"
	case captureFieldInterest:
		return "interes"
	case captureFieldTravelers:
		return "viajeros"
	case captureFieldTravelDate:
		return "fecha tentativa"
	case captureFieldSpecialOccasion:
		return "motivo especial"
	case captureFieldPreferredContactTime:
		return "mejor horario"
	default:
		return string(field)
	}
}

func captureFieldFromString(value string) (captureField, bool) {
	normalized := normalizeText(value)
	switch {
	case normalized == "" || normalized == "nil":
		return "", false
	case containsAny(normalized, []string{"name", "nombre"}):
		return captureFieldName, true
	case containsAny(normalized, []string{"phone", "telefono", "whatsapp", "telefono de contacto"}):
		return captureFieldPhone, true
	case containsAny(normalized, []string{"email", "correo", "mail"}):
		return captureFieldEmail, true
	case containsAny(normalized, []string{"interest", "interes", "itinerario", "experiencia", "destino", "ruta"}):
		return captureFieldInterest, true
	case containsAny(normalized, []string{"travelers", "viajeros", "personas", "pasajeros", "adultos", "adulto", "ninos", "menores"}):
		return captureFieldTravelers, true
	case containsAny(normalized, []string{"travel date", "travel_date", "fecha tentativa", "fecha", "mes", "salida", "temporada"}):
		return captureFieldTravelDate, true
	case containsAny(normalized, []string{"special occasion", "special_occasion", "motivo especial", "cumpleanos", "aniversario", "luna de miel", "boda", "celebracion"}):
		return captureFieldSpecialOccasion, true
	case containsAny(normalized, []string{"preferred contact time", "preferred_contact_time", "mejor horario", "horario", "hora", "cuando podemos contactarle", "cuando puede contactarle"}):
		return captureFieldPreferredContactTime, true
	default:
		return "", false
	}
}

func configuredCaptureFields(bot domain.BotKnowledge) []captureField {
	fields := make([]captureField, 0, len(bot.LeadCapture))
	seen := map[captureField]struct{}{}

	for _, raw := range bot.LeadCapture {
		field, ok := captureFieldFromString(raw)
		if !ok {
			continue
		}
		if _, exists := seen[field]; exists {
			continue
		}
		seen[field] = struct{}{}
		fields = append(fields, field)
	}

	return fields
}

func captureOrder(bot domain.BotKnowledge) []captureField {
	configured := configuredCaptureFields(bot)
	if len(configured) == 0 {
		order := make([]captureField, len(canonicalCaptureOrder))
		copy(order, canonicalCaptureOrder)
		return order
	}

	known := map[captureField]struct{}{}
	order := make([]captureField, 0, len(canonicalCaptureOrder))

	for _, field := range configured {
		order = append(order, field)
		known[field] = struct{}{}
	}

	for _, field := range canonicalCaptureOrder {
		if _, exists := known[field]; exists {
			continue
		}
		order = append(order, field)
		known[field] = struct{}{}
	}

	return order
}

func captureOrderText(bot domain.BotKnowledge) string {
	order := captureOrder(bot)
	labels := make([]string, 0, len(order))
	for _, field := range order {
		labels = append(labels, captureFieldLabel(field))
	}
	return strings.Join(labels, " -> ")
}

func configuredCaptureText(bot domain.BotKnowledge) string {
	fields := configuredCaptureFields(bot)
	if len(fields) == 0 {
		return "sin configuracion especifica"
	}

	labels := make([]string, 0, len(fields))
	for _, field := range fields {
		labels = append(labels, captureFieldLabel(field))
	}
	return strings.Join(labels, ", ")
}

func nextMissingCaptureField(bot domain.BotKnowledge, lead *domain.Lead, conversation *domain.Conversation) captureField {
	for _, field := range captureOrder(bot) {
		if captureFieldMissing(conversation, lead, field) {
			return field
		}
	}
	return ""
}

func captureFieldMissing(conversation *domain.Conversation, lead *domain.Lead, field captureField) bool {
	if lead == nil {
		return true
	}

	switch field {
	case captureFieldName:
		return strings.TrimSpace(lead.Name) == ""
	case captureFieldPhone:
		return strings.TrimSpace(lead.Phone) == ""
	case captureFieldEmail:
		if emailRefused(conversation) {
			return false
		}
		return strings.TrimSpace(lead.Email) == ""
	case captureFieldInterest:
		return strings.TrimSpace(lead.Interest) == ""
	case captureFieldTravelers:
		return strings.TrimSpace(lead.Travelers) == ""
	case captureFieldTravelDate:
		return strings.TrimSpace(lead.TravelDate) == ""
	case captureFieldSpecialOccasion:
		return strings.TrimSpace(lead.SpecialOccasion) == ""
	case captureFieldPreferredContactTime:
		return strings.TrimSpace(lead.PreferredContactTime) == ""
	default:
		return false
	}
}

func emailRefused(conversation *domain.Conversation) bool {
	if conversation == nil || conversation.Metadata == nil {
		return false
	}

	value, ok := conversation.Metadata["email_refused"]
	if !ok {
		return false
	}

	refused, ok := value.(bool)
	return ok && refused
}

func captureQuestionForField(field captureField, bot domain.BotKnowledge, lead *domain.Lead, conversation *domain.Conversation) string {
	if field == "" {
		return ""
	}

	if question := qualificationQuestionForField(bot.QualificationQuestions, field); question != "" {
		return question
	}

	switch field {
	case captureFieldName:
		return "Con gusto le ayudo. Me comparte su nombre?"
	case captureFieldPhone:
		if phoneRefused(conversation) {
			return "Entiendo. Solo necesito su numero de WhatsApp para compartirle la informacion y darle seguimiento. Me lo comparte, por favor?"
		}
		return "Gracias. Me comparte su numero de telefono o WhatsApp para darle seguimiento?"
	case captureFieldEmail:
		return "Excelente. Me comparte su correo electronico para enviarle la informacion o la propuesta?"
	case captureFieldInterest:
		if len(bot.Itineraries) >= 3 {
			return fmt.Sprintf("Gracias. Si le parece bien, puedo orientarle entre %s, %s y %s. Cual de estas experiencias le atrae mas?", bot.Itineraries[0].Name, bot.Itineraries[1].Name, bot.Itineraries[2].Name)
		}
		if len(bot.Itineraries) > 0 {
			names := make([]string, 0, len(bot.Itineraries))
			for _, itinerary := range bot.Itineraries {
				names = append(names, itinerary.Name)
			}
			return fmt.Sprintf("Gracias. Puedo orientarle entre %s. Cual de estas experiencias le atrae mas?", strings.Join(names, ", "))
		}
		return "Gracias. Que itinerario o tipo de experiencia le interesa mas?"
	case captureFieldTravelers:
		return "Perfecto. Cuantas personas viajarian?"
	case captureFieldTravelDate:
		return "Tiene una fecha tentativa o al menos un mes aproximado para viajar?"
	case captureFieldSpecialOccasion:
		return "Hay algun motivo especial para este viaje, como cumpleanos, aniversario o luna de miel?"
	case captureFieldPreferredContactTime:
		return "Cual es el mejor horario para que un asesor le contacte?"
	default:
		return ""
	}
}

func qualificationQuestionForField(questions []string, field captureField) string {
	for _, question := range questions {
		if questionTargetField(question) == field {
			return question
		}
	}
	return ""
}

func questionTargetField(question string) captureField {
	normalized := normalizeText(question)

	targets := make([]captureField, 0, 2)
	if containsAny(normalized, []string{"nombre", "como le llamo", "cual es su nombre", "nombre completo"}) {
		targets = append(targets, captureFieldName)
	}
	if containsAny(normalized, []string{"telefono", "whatsapp", "numero de contacto", "numero telefonico", "numero de telefono"}) {
		targets = append(targets, captureFieldPhone)
	}
	if containsAny(normalized, []string{"correo", "email", "mail"}) {
		targets = append(targets, captureFieldEmail)
	}
	if containsAny(normalized, []string{"interes", "itinerario", "experiencia", "destino", "ruta", "viajar", "viaje", "opcion"}) {
		targets = append(targets, captureFieldInterest)
	}
	if containsAny(normalized, []string{"cuantas personas", "cuantos viajeros", "numero de viajeros", "personas viajar", "viajarian", "pasajeros"}) {
		targets = append(targets, captureFieldTravelers)
	}
	if containsAny(normalized, []string{"fecha tentativa", "fecha", "mes aproximado", "mes", "salida", "temporada", "cuando viajar"}) {
		targets = append(targets, captureFieldTravelDate)
	}
	if containsAny(normalized, []string{"motivo especial", "cumpleanos", "aniversario", "luna de miel", "boda", "celebracion", "occasion"}) {
		targets = append(targets, captureFieldSpecialOccasion)
	}
	if containsAny(normalized, []string{"mejor horario", "horario", "hora", "contacte", "contactarle", "cuando podemos contactarle", "cuando puede contactarle"}) {
		targets = append(targets, captureFieldPreferredContactTime)
	}

	if len(targets) == 1 {
		return targets[0]
	}

	return ""
}

func captureLeadCaptureText(bot domain.BotKnowledge) string {
	if len(bot.LeadCapture) == 0 {
		return "sin configuracion especifica"
	}
	return strings.Join(bot.LeadCapture, ", ")
}

func handoffTriggersText(bot domain.BotKnowledge) string {
	if len(bot.Handoff.Triggers) == 0 {
		return "sin triggers configurados"
	}
	return strings.Join(bot.Handoff.Triggers, ", ")
}

func handoffIntentDetected(bot domain.BotKnowledge, message string) bool {
	keywords := []string{
		"asesor",
		"hablar con alguien",
		"contactar",
		"contacto con un asesor",
		"quiero reservar",
	}
	keywords = append(keywords, bot.Handoff.Triggers...)
	return containsAny(message, keywords)
}
