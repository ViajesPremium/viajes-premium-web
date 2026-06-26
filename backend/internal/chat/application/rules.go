package application

import (
	"fmt"
	"strings"
	"time"

	"backend/internal/chat/domain"
)

func BuildRuleResponse(bot domain.BotKnowledge, conversation *domain.Conversation, lead *domain.Lead, userMessage string, now time.Time, handoff HandoffDecision) string {
	normalized := normalizeText(userMessage)

	if followupOptOutIntent(normalized) || followupDeclined(conversation) {
		return followupDeclinedResponse(lead)
	}

	if parsedDate, ok := travelDateBeyondPlanningHorizon(userMessage, now); ok {
		return longRangeTravelDateResponse(lead, parsedDate)
	}

	if handoff.Required {
		return firstNonEmpty(
			bot.Handoff.ClosingMessage,
			"Con gusto le compartimos un seguimiento personalizado. Un asesor especializado le contactara en breve.",
		)
	}

	if reply, ok := dateGuardResponse(now, normalized); ok {
		return appendStrictFollowUp(reply, bot, lead, conversation)
	}

	if reply, ok := invalidPhoneAttemptResponse(bot, conversation, lead, userMessage); ok {
		return reply
	}

	if reply, ok := phoneRefusalResponse(bot, conversation, lead, normalized); ok {
		return reply
	}

	if reply, ok := itineraryCatalogResponse(bot, lead, normalized); ok {
		if expressesNoItineraryFit(normalized) {
			return customizationResponse(bot, lead, conversation)
		}
		return reply
	}

	if reply, ok := contactQuestionResponse(bot, normalized); ok {
		return appendStrictFollowUp(reply, bot, lead, conversation)
	}

	if reply, ok := locationQuestionResponse(bot, normalized); ok {
		return appendStrictFollowUp(reply, bot, lead, conversation)
	}

	if dateValue := detectTravelDate(normalized, now); dateValue != "" {
		return appendStrictFollowUp(travelDateCaptureResponse(dateValue), bot, lead, conversation)
	}

	if response := generalBrandResponse(bot, conversation, lead, normalized); response != "" {
		return appendStrictFollowUp(response, bot, lead, conversation)
	}

	if response := matchItinerary(bot, normalized); response != "" {
		return response + " " + nextCaptureQuestion(bot, lead, conversation)
	}

	if response := matchFAQ(bot, normalized); response != "" {
		return response + " " + nextCaptureQuestion(bot, lead, conversation)
	}

	return fallbackQuestion(bot, lead, conversation)
}

func matchItinerary(bot domain.BotKnowledge, message string) string {
	for _, itinerary := range bot.Itineraries {
		if strings.Contains(message, normalizeText(itinerary.Name)) {
			return fmt.Sprintf("%s tiene una duracion de %s. %s Ideal para %s. %s", itinerary.Name, itinerary.Duration, itinerary.Summary, itinerary.IdealFor, customizationOffer())
		}
		for _, keyword := range itinerary.Highlights {
			if strings.Contains(message, normalizeText(keyword)) {
				return fmt.Sprintf("%s se distingue por %s. %s", itinerary.Name, strings.Join(itinerary.Highlights, ", "), customizationOffer())
			}
		}
	}
	return ""
}

func matchFAQ(bot domain.BotKnowledge, message string) string {
	if !looksLikeQuestion(message) {
		return ""
	}

	for _, faq := range bot.FAQs {
		if faqMatchScore(message, faq.Question) >= 2 {
			return faq.Answer
		}
	}
	return ""
}

func faqMatchScore(message string, question string) int {
	normalizedMessage := normalizeText(message)
	if normalizedMessage == "" {
		return 0
	}

	normalizedQuestion := normalizeText(question)
	if normalizedQuestion != "" && strings.Contains(normalizedMessage, normalizedQuestion) {
		return 100
	}

	score := 0
	for _, keyword := range splitKeywords(question) {
		if strings.Contains(normalizedMessage, normalizeText(keyword)) {
			score++
		}
	}
	return score
}

func generalBrandResponse(bot domain.BotKnowledge, conversation *domain.Conversation, lead *domain.Lead, message string) string {
	switch {
	case isPricingQuestion(message):
		var itinerary *domain.Itinerary
		if itinerary = itineraryFromMessage(bot, message); itinerary == nil {
			itinerary = itineraryFromLead(bot, lead)
			if itinerary == nil && len(bot.Itineraries) > 0 {
				parts := make([]string, 0, len(bot.Itineraries))
				for _, item := range bot.Itineraries {
					text := item.Name
					if item.Price != "" {
						text += " " + item.Price
					}
					parts = append(parts, text)
				}
				return "Con gusto. " + customizationOffer() + " Las opciones principales son: " + strings.Join(parts, "; ") + "."
			}
		}
		if itinerary != nil {
			if itinerary.Price != "" {
				return fmt.Sprintf("Con gusto. %s El itinerario %s tiene un precio base de %s. El valor final puede ajustarse segun fechas, ocupacion y tipo de habitacion.", customizationOffer(), itinerary.Name, itinerary.Price)
			}
			return fmt.Sprintf("Con gusto. %s El itinerario %s es una excelente opcion. Si desea, le comparto el siguiente paso para cotizarlo con mayor precision.", customizationOffer(), itinerary.Name)
		}
	case strings.Contains(message, "fecha"), strings.Contains(message, "salida"), strings.Contains(message, "disponib"):
		return "Podemos revisar las salidas disponibles y ajustar el viaje a su calendario."
	case strings.Contains(message, "donde"), strings.Contains(message, "ubicad"), strings.Contains(message, "direccion"):
		if reply, ok := locationQuestionResponse(bot, message); ok {
			return reply
		}
	case strings.Contains(message, "telefono"), strings.Contains(message, "whatsapp"), strings.Contains(message, "marcar"), strings.Contains(message, "llamar"):
		if reply, ok := contactQuestionResponse(bot, message); ok {
			return reply
		}
	case isItineraryCatalogQuestion(message):
		if reply, ok := itineraryCatalogResponse(bot, lead, message); ok {
			return reply
		}
	case strings.Contains(message, "incluye"), strings.Contains(message, "que incluye"):
		if itinerary := itineraryFromLead(bot, lead); itinerary != nil {
			return fmt.Sprintf("%s es ideal para %s y destaca por %s.", itinerary.Name, strings.ToLower(itinerary.IdealFor), strings.Join(itinerary.Highlights, ", "))
		}
		return "El viaje suele incluir alojamiento seleccionado, traslados bien coordinados, experiencias curadas y acompanamiento en cada etapa."
	case expressesNoItineraryFit(message):
		return customizationResponse(bot, lead, conversation)
	case strings.Contains(message, "quien"), strings.Contains(message, "asesor"), strings.Contains(message, "hablar con alguien"):
		return "Con gusto. Puedo ayudarle a avanzar y, si lo prefiere, un asesor especializado puede darle seguimiento."
	case lead.Interest != "" && conversation != nil && conversation.Stage == domain.StageQualify && shouldDescribeKnownItinerary(message, bot, lead):
		if itinerary := itineraryFromLead(bot, lead); itinerary != nil {
			return fmt.Sprintf("Con gusto. %s es una experiencia muy bien curada, pensada para %s. Sus puntos mas atractivos son %s. %s %s", itinerary.Name, strings.ToLower(itinerary.IdealFor), strings.Join(itinerary.Highlights, ", "), customizationOffer(), nextCaptureQuestion(bot, lead, conversation))
		}
	case bot.Slug == "home":
		return homeResponse(bot, lead, message)
	}
	return ""
}

func itineraryCatalogResponse(bot domain.BotKnowledge, lead *domain.Lead, message string) (string, bool) {
	if !isItineraryCatalogQuestion(message) {
		return "", false
	}

	if len(bot.Itineraries) == 0 {
		return "", false
	}

	name := ""
	if lead != nil {
		name = strings.TrimSpace(lead.Name)
	}
	prefix := "Con gusto."
	if name != "" {
		prefix = fmt.Sprintf("Con gusto, %s.", name)
	}

	parts := make([]string, 0, len(bot.Itineraries))
	for _, itinerary := range bot.Itineraries {
		line := itinerary.Name
		if itinerary.Duration != "" {
			line += " (" + itinerary.Duration + ")"
		}
		if itinerary.Price != "" {
			line += " - " + itinerary.Price
		}
		parts = append(parts, line)
	}

	if len(parts) >= 3 {
		return fmt.Sprintf("%s Nuestros itinerarios principales son %s, %s y %s. Si ninguno se ajusta a lo que busca, tambien podemos disenar algo a medida. Cual le gustaria ver primero?", prefix, parts[0], parts[1], parts[2]), true
	}

	return fmt.Sprintf("%s Nuestros itinerarios disponibles son %s. Si ninguno se ajusta a lo que busca, tambien podemos disenar algo a medida. Cual le gustaria ver primero?", prefix, strings.Join(parts, "; ")), true
}

func invalidPhoneAttemptResponse(bot domain.BotKnowledge, conversation *domain.Conversation, lead *domain.Lead, userMessage string) (string, bool) {
	if lead != nil && strings.TrimSpace(lead.Phone) != "" {
		return "", false
	}
	if !isInvalidPhoneAttempt(userMessage) {
		return "", false
	}

	if phoneRefused(conversation) {
		return "Entiendo. Solo necesito su numero de WhatsApp para compartirle la informacion y darle seguimiento. Me lo comparte, por favor?", true
	}

	return "Ese numero no parece valido. Necesito un numero real de WhatsApp para continuar, me lo comparte de nuevo?", true
}

func phoneRefusalResponse(bot domain.BotKnowledge, conversation *domain.Conversation, lead *domain.Lead, message string) (string, bool) {
	if lead != nil && strings.TrimSpace(lead.Phone) != "" {
		return "", false
	}
	if conversation == nil || !phoneRefused(conversation) {
		return "", false
	}
	if !containsAny(message, []string{"no quiero", "prefiero no", "no deseo", "no me gusta", "no quiero llamadas", "no llamadas", "llamadas", "marquen", "marcar", "llamen", "llame"}) {
		return "", false
	}

	return "Entiendo. Solo necesito su numero de WhatsApp para compartirle la informacion y darle seguimiento. Me lo comparte, por favor?", true
}

func customizationOffer() string {
	return "Si ninguna opcion le convence, podemos disenarle una experiencia a medida."
}

func shouldDescribeKnownItinerary(message string, bot domain.BotKnowledge, lead *domain.Lead) bool {
	if lead == nil || strings.TrimSpace(lead.Interest) == "" {
		return false
	}

	if itineraryFromMessage(bot, message) != nil {
		return true
	}

	normalized := normalizeText(message)
	return containsAny(normalized, []string{
		"itinerario",
		"itinerarios",
		"experiencia",
		"experiencias",
		"opcion",
		"opciones",
		"ruta",
		"rutas",
		"incluye",
		"incluyen",
		"detalles",
		"detalle",
		"mas sobre",
		"cuenteme mas",
		"cuentame mas",
		"que mas",
		"otras opciones",
		"mas opciones",
	})
}

func customizationResponse(bot domain.BotKnowledge, lead *domain.Lead, conversation *domain.Conversation) string {
	prefix := "Entiendo."
	if lead != nil && strings.TrimSpace(lead.Name) != "" {
		prefix = fmt.Sprintf("Entiendo, %s.", lead.Name)
	}
	return strings.TrimSpace(prefix + " " + customizationOffer() + " " + nextCaptureQuestion(bot, lead, conversation))
}

func expressesNoItineraryFit(message string) bool {
	return containsAny(message, []string{
		"ninguno",
		"ninguna",
		"ningun itinerario",
		"ningun itinerario me",
		"ninguno de tus itinerarios",
		"ninguna de tus opciones",
		"no tienes mas",
		"no tienes mas itinerarios",
		"no tienes otras opciones",
		"no me gusto",
		"no me gustaron",
		"no me gustan",
		"no me convence",
		"no se ajusta",
		"no se adapta",
		"otra opcion",
		"otras opciones",
		"mas itinerarios",
		"mas opciones",
	})
}
func contactQuestionResponse(bot domain.BotKnowledge, message string) (string, bool) {
	if !isContactQuestion(message) {
		return "", false
	}

	contact := brandContactInfo(bot.Slug)
	parts := []string{
		"Con gusto.",
	}
	if contact.PhoneDisplay != "" {
		parts = append(parts, "Puede marcar al "+contact.PhoneDisplay+" o escribir por WhatsApp al mismo numero.")
	}
	if contact.Email != "" {
		parts = append(parts, "Tambien puede escribir a "+contact.Email+".")
	}
	return strings.Join(parts, " "), true
}

func phoneRefused(conversation *domain.Conversation) bool {
	if conversation == nil || conversation.Metadata == nil {
		return false
	}

	value, ok := conversation.Metadata["phone_refused"]
	if !ok {
		return false
	}

	refused, ok := value.(bool)
	return ok && refused
}

func followupDeclined(conversation *domain.Conversation) bool {
	if conversation == nil || conversation.Metadata == nil {
		return false
	}

	value, ok := conversation.Metadata["followup_declined"]
	if !ok {
		return false
	}

	declined, ok := value.(bool)
	return ok && declined
}

func followupDeclinedResponse(lead *domain.Lead) string {
	if lead != nil && strings.TrimSpace(lead.Name) != "" {
		return fmt.Sprintf("Entendido, %s. Gracias por su tiempo y su confianza.", lead.Name)
	}
	return "Entendido. Gracias por su tiempo y su confianza."
}

func locationQuestionResponse(bot domain.BotKnowledge, message string) (string, bool) {
	if !isLocationQuestion(message) {
		return "", false
	}

	contact := brandContactInfo(bot.Slug)
	if contact.Address == "" {
		return "", false
	}

	return "Estamos ubicados en " + contact.Address + ". Si lo desea, tambien le comparto el numero de contacto para atenderle ahora mismo.", true
}

func homeResponse(bot domain.BotKnowledge, lead *domain.Lead, message string) string {
	if strings.Contains(message, "japon") {
		return "Japon Premium reune una experiencia muy completa entre tradicion, cultura y un viaje cuidadosamente disenado."
	}
	if strings.Contains(message, "europa") {
		return "Europa Premium ofrece recorridos clasicos y cosmopolitas, pensados para viajar con calma y criterio."
	}
	if strings.Contains(message, "corea") {
		return "Corea Premium combina tradicion, tecnologia y cultura contemporanea en un recorrido muy bien curado."
	}
	if strings.Contains(message, "canad") {
		return "Canada Premium destaca por naturaleza, montanas, ciudades elegantes e itinerarios con gran confort."
	}
	if strings.Contains(message, "peru") {
		return "Peru Premium mezcla Andes, gastronomia y paisajes extraordinarios en experiencias de alto valor."
	}
	if strings.Contains(message, "chiapas") {
		return "Chiapas Premium conecta selva, cascadas, pueblos magicos y cultura mexicana con un enfoque premium."
	}
	if strings.Contains(message, "barranca") || strings.Contains(message, "chepe") {
		return "Barrancas Premium vive el Chepe Express, los miradores y la Sierra Tarahumara con un nivel superior de atencion."
	}
	if strings.Contains(message, "yucatan") {
		return "Yucatan Premium combina cenotes, haciendas, cultura maya y descanso con una propuesta muy cuidada."
	}
	return "Le puedo ayudar a encontrar la experiencia ideal segun el destino que tenga en mente."
}

func travelDateCaptureResponse(dateValue string) string {
	if strings.TrimSpace(dateValue) == "" {
		return ""
	}

	return fmt.Sprintf("Perfecto, tomo %s como fecha tentativa.", formatTravelDateForReply(dateValue))
}

func longRangeTravelDateResponse(lead *domain.Lead, dateValue time.Time) string {
	label := formatTravelDateForReply(dateValue.Format("2006-01-02"))
	prefix := "Entiendo."
	if lead != nil && strings.TrimSpace(lead.Name) != "" {
		prefix = fmt.Sprintf("Entiendo, %s.", lead.Name)
	}

	return fmt.Sprintf("%s Aun no contamos con tarifas ni vuelos para %s. El precio es para anticipar una compra o para referencia de su valor y planearlo a futuro.", prefix, label)
}

func formatTravelDateForReply(value string) string {
	parsed, err := time.Parse("2006-01-02", strings.TrimSpace(value))
	if err != nil {
		return strings.TrimSpace(value)
	}

	month := spanishMonthName(parsed.Month())
	if parsed.Day() == 1 {
		return fmt.Sprintf("%s de %d", month, parsed.Year())
	}

	return fmt.Sprintf("%d de %s de %d", parsed.Day(), month, parsed.Year())
}

func spanishMonthName(month time.Month) string {
	switch month {
	case time.January:
		return "enero"
	case time.February:
		return "febrero"
	case time.March:
		return "marzo"
	case time.April:
		return "abril"
	case time.May:
		return "mayo"
	case time.June:
		return "junio"
	case time.July:
		return "julio"
	case time.August:
		return "agosto"
	case time.September:
		return "septiembre"
	case time.October:
		return "octubre"
	case time.November:
		return "noviembre"
	case time.December:
		return "diciembre"
	default:
		return month.String()
	}
}

func fallbackQuestion(bot domain.BotKnowledge, lead *domain.Lead, conversation *domain.Conversation) string {
	if followupDeclined(conversation) {
		return followupDeclinedResponse(lead)
	}
	if lead.Name == "" ||
		lead.Phone == "" ||
		lead.Interest == "" ||
		lead.Travelers == "" ||
		lead.TravelDate == "" ||
		lead.SpecialOccasion == "" ||
		lead.PreferredContactTime == "" {
		return nextCaptureQuestion(bot, lead, conversation)
	}
	return handoffClosingMessage(bot, lead)
}

func nextCaptureQuestion(bot domain.BotKnowledge, lead *domain.Lead, conversation *domain.Conversation) string {
	if followupDeclined(conversation) {
		return ""
	}
	nextField := nextMissingCaptureField(bot, lead, conversation)
	if nextField == "" {
		return handoffClosingMessage(bot, lead)
	}

	if question := qualificationQuestionForField(bot.QualificationQuestions, nextField); question != "" {
		return question
	}

	return captureQuestionForField(nextField, bot, lead, conversation)
}

func shouldUseQualificationQuestion(question string, lead *domain.Lead) bool {
	field := questionTargetField(question)
	if field == "" {
		return false
	}
	return captureFieldMissing(nil, lead, field)
}

func appendStrictFollowUp(reply string, bot domain.BotKnowledge, lead *domain.Lead, conversation *domain.Conversation) string {
	cleanReply := strings.TrimSpace(reply)
	if followupDeclined(conversation) {
		return cleanReply
	}
	next := strings.TrimSpace(nextCaptureQuestion(bot, lead, conversation))
	if cleanReply == "" || next == "" {
		return cleanReply
	}

	normalizedReply := normalizeText(cleanReply)
	normalizedNext := normalizeText(next)
	if normalizedReply == normalizedNext || strings.Contains(normalizedReply, normalizedNext) {
		return cleanReply
	}

	lastChar := cleanReply[len(cleanReply)-1]
	if lastChar != '.' && lastChar != '?' && lastChar != '!' {
		cleanReply += "."
	}
	return cleanReply + " " + next
}

func handoffClosingMessage(bot domain.BotKnowledge, lead *domain.Lead) string {
	base := firstNonEmpty(
		bot.Handoff.ClosingMessage,
		"Con gusto. Un asesor especializado le dara seguimiento en breve con su propuesta personalizada.",
	)

	name := ""
	if lead != nil {
		name = strings.TrimSpace(lead.Name)
	}
	if name == "" {
		return base
	}

	interest := ""
	if lead != nil {
		interest = strings.TrimSpace(lead.Interest)
	}
	if interest != "" {
		return fmt.Sprintf("Con gusto, %s. Queda registrado que le interesa %s. Un asesor especializado le dara seguimiento en breve con su propuesta personalizada.", name, interest)
	}

	return fmt.Sprintf("Con gusto, %s. Un asesor especializado le dara seguimiento en breve con su propuesta personalizada.", name)
}

func ensureResponseAdvancesFlow(reply string, bot domain.BotKnowledge, lead *domain.Lead, conversation *domain.Conversation, userMessage string) string {
	cleanReply := strings.TrimSpace(reply)
	if followupDeclined(conversation) || responseLooksClosed(cleanReply) {
		return cleanReply
	}
	next := strings.TrimSpace(nextCaptureQuestion(bot, lead, conversation))
	if cleanReply == "" || next == "" {
		return cleanReply
	}

	if looksLikeQuestion(normalizeText(userMessage)) {
		return cleanReply
	}
	if strings.Contains(cleanReply, "?") {
		return cleanReply
	}

	normalizedReply := normalizeText(cleanReply)
	normalizedNext := normalizeText(next)
	if normalizedReply == normalizedNext || strings.Contains(normalizedReply, normalizedNext) {
		return cleanReply
	}
	if responseAlreadyAdvancesFlow(normalizedReply) {
		return cleanReply
	}
	if normalizedNext == normalizeText(handoffClosingMessage(bot, lead)) {
		lastChar := cleanReply[len(cleanReply)-1]
		if lastChar != '.' && lastChar != '?' && lastChar != '!' {
			cleanReply += "."
		}
		return cleanReply + " " + next
	}

	bridge := "Si le parece bien,"
	if lead != nil && strings.TrimSpace(lead.Name) != "" {
		bridge = fmt.Sprintf("Si le parece bien, %s,", lead.Name)
	}

	lastChar := cleanReply[len(cleanReply)-1]
	if lastChar != '.' && lastChar != '?' && lastChar != '!' {
		cleanReply += "."
	}

	return cleanReply + " " + bridge + " " + lowerFirst(next)
}

func responseAlreadyAdvancesFlow(reply string) bool {
	if strings.Contains(reply, "?") {
		return true
	}

	requestMarkers := []string{
		"me comparte su nombre",
		"me comparte su telefono",
		"me comparte su numero",
		"me comparte su correo",
		"me comparte su email",
		"me comparte su whatsapp",
		"me regala su nombre",
		"me regala su telefono",
		"me regala su numero",
		"me regala su correo",
		"me regala su email",
		"me regala su whatsapp",
		"me deja su nombre",
		"me deja su telefono",
		"me deja su numero",
		"me deja su correo",
		"me deja su email",
		"me deja su whatsapp",
		"me proporciona su telefono",
		"me proporciona su numero",
		"me proporciona su correo",
		"me proporciona su email",
		"me podria compartir su telefono",
		"me podria compartir su numero",
		"me podria compartir su correo",
		"me podria compartir su email",
		"podria compartirme su telefono",
		"podria compartirme su numero",
		"podria compartirme su correo",
		"podria compartirme su email",
		"podria indicarme su telefono",
		"podria indicarme su numero",
		"podria decirme su telefono",
		"podria decirme su numero",
		"su numero de whatsapp",
		"su numero de telefono",
		"su correo electronico",
		"telefono o whatsapp",
		"numero de whatsapp",
		"numero de telefono",
		"correo electronico",
		"cuantas personas",
		"fecha tentativa",
		"mes aproximado",
		"motivo especial",
		"mejor horario",
	}
	return containsAny(reply, []string{
		"me comparte",
		"me permite",
		"me podria",
		"podria compartirme",
		"podria decirme",
		"podria indicarme",
		"me regala",
		"me deja",
		"me proporciona",
		"su numero",
		"su telefono",
		"si le parece bien",
		"siguiente paso",
		"para continuar",
		"para seguir",
		"para preparar",
		"para armar",
		"para cotizar",
	}) || containsAny(reply, requestMarkers)
}

func responseLooksClosed(reply string) bool {
	if reply == "" {
		return false
	}

	return containsAny(reply, []string{
		"respeto su decision",
		"respeto completamente su decision",
		"gracias por su tiempo",
		"si en el futuro desea retomar",
		"si en el futuro",
		"aqui estoy para usted",
		"le deseo lo mejor",
		"que tenga una excelente",
		"cuide se",
		"cuidese mucho",
		"me retiro",
		"le agradezco",
		"le contactara",
		"le contactará",
		"le dara seguimiento",
		"le dará seguimiento",
		"seguimiento en breve",
		"quedo atento",
		"quedamos atentos",
		"estamos a sus ordenes",
		"estamos a sus órdenes",
		"a sus ordenes",
		"a sus órdenes",
		"todo esta listo de mi parte",
		"todo está listo de mi parte",
		"si lo desea, puedo ayudarle a afinar su viaje",
		"puedo ayudarle a afinar su viaje",
		"si lo desea, puedo ayudarle a elegir el itinerario ideal",
		"puedo ayudarle a elegir el itinerario ideal",
		"un asesor puede darle seguimiento personalizado",
	})
}

func lowerFirst(value string) string {
	if strings.TrimSpace(value) == "" {
		return value
	}
	runes := []rune(value)
	runes[0] = []rune(strings.ToLower(string(runes[0])))[0]
	return string(runes)
}

func itineraryFromMessage(bot domain.BotKnowledge, message string) *domain.Itinerary {
	target := normalizeText(message)
	if target == "" {
		return nil
	}

	for i := range bot.Itineraries {
		itinerary := &bot.Itineraries[i]
		if strings.Contains(target, normalizeText(itinerary.Name)) {
			return itinerary
		}
		for _, highlight := range itinerary.Highlights {
			if strings.Contains(target, normalizeText(highlight)) {
				return itinerary
			}
		}
	}

	return nil
}

func itineraryFromLead(bot domain.BotKnowledge, lead *domain.Lead) *domain.Itinerary {
	if lead == nil {
		return nil
	}

	target := normalizeText(lead.Interest)
	if target == "" {
		return nil
	}

	for i := range bot.Itineraries {
		itinerary := &bot.Itineraries[i]
		if strings.Contains(target, normalizeText(itinerary.Name)) {
			return itinerary
		}
		for _, highlight := range itinerary.Highlights {
			if strings.Contains(target, normalizeText(highlight)) {
				return itinerary
			}
		}
	}

	return nil
}

func reinforceResponseContinuity(reply string, lead *domain.Lead, bot domain.BotKnowledge) string {
	cleanReply := strings.TrimSpace(reply)
	if cleanReply == "" || lead == nil {
		return cleanReply
	}

	normalized := normalizeText(cleanReply)
	if lead.Interest != "" && asksToRequalifyInterest(normalized) {
		return continuityBridge(lead, bot)
	}
	if lead.Name != "" && asksForName(normalized) {
		return continuityBridge(lead, bot)
	}
	if lead.Phone != "" && asksForPhone(normalized) {
		return continuityBridge(lead, bot)
	}
	if lead.Email != "" && asksForEmail(normalized) {
		return continuityBridge(lead, bot)
	}
	if lead.Travelers != "" && asksForTravelers(normalized) {
		return continuityBridge(lead, bot)
	}
	if lead.TravelDate != "" && asksForTravelDate(normalized) {
		return continuityBridge(lead, bot)
	}
	if lead.SpecialOccasion != "" && asksForSpecialOccasion(normalized) {
		return continuityBridge(lead, bot)
	}
	if lead.PreferredContactTime != "" && asksForPreferredContactTime(normalized) {
		return continuityBridge(lead, bot)
	}

	return cleanReply
}

func continuityBridge(lead *domain.Lead, bot domain.BotKnowledge) string {
	parts := make([]string, 0, 3)

	if lead.Name != "" {
		parts = append(parts, fmt.Sprintf("Con gusto, %s.", lead.Name))
	} else {
		parts = append(parts, "Con gusto.")
	}

	if next := nextCaptureQuestion(bot, lead, nil); next != "" {
		parts = append(parts, next)
	}

	return strings.Join(parts, " ")
}

func asksToRequalifyInterest(reply string) bool {
	return containsAny(reply, []string{
		"que itinerario le interesa",
		"que itinerario te interesa",
		"que tipo de experiencia le interesa",
		"cual de estas experiencias",
		"cual de estos itinerarios",
		"que destino le interesa",
	})
}

func asksForName(reply string) bool {
	return containsAny(reply, []string{
		"me comparte su nombre",
		"su nombre",
		"nombre completo",
		"cual es su nombre",
	})
}

func asksForPhone(reply string) bool {
	return containsAny(reply, []string{
		"telefono",
		"whatsapp",
		"numero de contacto",
		"numero de telefono",
		"contactarle",
	})
}

func asksForEmail(reply string) bool {
	return containsAny(reply, []string{
		"correo",
		"correo electronico",
		"email",
		"mail",
	})
}

func asksForTravelers(reply string) bool {
	return containsAny(reply, []string{
		"cuantas personas",
		"cuantos viajeros",
		"numero de viajeros",
		"cuantos pasaj",
	})
}

func asksForTravelDate(reply string) bool {
	return containsAny(reply, []string{
		"fecha tentativa",
		"mes aproximado",
		"cuando viajar",
		"cuando le gustaria viajar",
		"cuando le gustarÃ­a viajar",
	})
}

func asksForSpecialOccasion(reply string) bool {
	return containsAny(reply, []string{
		"motivo especial",
		"cumpleanos",
		"cumpleaÃ±os",
		"aniversario",
		"luna de miel",
	})
}

func asksForPreferredContactTime(reply string) bool {
	return containsAny(reply, []string{
		"mejor horario",
		"que horario",
		"quÃƒÂ© horario",
		"cuando puede contactarle",
		"cuando podemos contactarle",
	})
}

func splitKeywords(value string) []string {
	fields := strings.FieldsFunc(normalizeText(value), func(r rune) bool {
		return r == ' ' || r == '?' || r == ':' || r == ',' || r == '.' || r == ';' || r == '!'
	})
	words := make([]string, 0, len(fields))
	for _, field := range fields {
		field = strings.TrimSpace(field)
		if len(field) >= 3 {
			words = append(words, field)
		}
	}
	return words
}

func containsAny(message string, keywords []string) bool {
	normalizedMessage := normalizeText(message)
	for _, keyword := range keywords {
		if keyword == "" {
			continue
		}
		if strings.Contains(normalizedMessage, normalizeText(keyword)) {
			return true
		}
	}
	return false
}

func firstSliceOr(values []string, fallback string) string {
	if len(values) == 0 {
		return fallback
	}
	if trimmed := strings.TrimSpace(values[0]); trimmed != "" {
		return trimmed
	}
	return fallback
}
