package application

import (
	"fmt"
	"strings"
	"time"

	"backend/internal/chat/domain"
)

func BuildPrompt(bot domain.BotKnowledge, conversation *domain.Conversation, lead *domain.Lead, messages []domain.Message, userMessage string, ruleGuide string, handoffThreshold int, now time.Time) PromptRequest {
	leadSummary := []string{
		"nombre=" + firstNonEmpty(lead.Name, "pendiente"),
		"telefono=" + firstNonEmpty(lead.Phone, "pendiente"),
		"correo=" + firstNonEmpty(lead.Email, "pendiente"),
		"fecha_tentativa=" + firstNonEmpty(lead.TravelDate, "pendiente"),
		"interes=" + firstNonEmpty(lead.Interest, "pendiente"),
		"viajeros=" + firstNonEmpty(lead.Travelers, "pendiente"),
		"motivo_especial=" + firstNonEmpty(lead.SpecialOccasion, "pendiente"),
		"mejor_horario=" + firstNonEmpty(lead.PreferredContactTime, "pendiente"),
		"score=" + fmt.Sprintf("%d", lead.Score),
		"stage=" + string(lead.Stage),
	}

	knowledgeSummary := buildKnowledgeSummary(bot)
	contact := brandContactInfo(bot.Slug)
	knowledgeMarkdown := buildKnowledgeMarkdown(bot, contact)
	systemPrompt := joinPromptSections(
		bot.BehaviorPrompt,
		bot.MasterPrompt,
		"Eres un concierge de viajes premium. Debes sonar humano, elegante, sereno, preciso y comercial sin parecer robotico ni insistente.",
		"Escribe siempre en español con ortografia correcta: usa ñ, acentos, tildes y signos de apertura cuando correspondan.",
		"Evita escribir en mayusculas innecesarias o en estilo telegráfico; redacta como un asesor humano real.",
		"Trata al visitante de usted, salvo que el propio visitante marque otro tono.",
		"Usa el nombre del visitante tal como fue compartido. Si te dio un nombre completo, dirigete a esa persona con el nombre completo; si solo te dio un nombre, usa ese mismo nombre sin inventar apellidos ni resumirlo al primer nombre.",
		"Prioridad de respuesta: 1) responde primero la pregunta concreta del visitante; 2) si el mensaje aporta un dato de captura, reconocelo con naturalidad; 3) despues avanza solo un paso del flujo si todavia falta algo importante.",
		"El tono debe sentirse conversado, humano y empatico. Evita muletillas repetitivas, frases copiadas del sistema y cierres mecanicos como 'perfecto, para continuar'.",
		"Si el visitante pregunta por itinerarios, precios, duraciones, incluye, fechas o disponibilidad, responde esa duda antes de pedir cualquier dato.",
		"Si el visitante pregunta por itinerarios, opciones o paquetes, muestra primero el catalogo o un resumen claro. Solo agrega una pregunta breve si de verdad ayuda a avanzar.",
		"Si el visitante dice que ningun itinerario le convence o que necesita algo mas compacto, menciona de inmediato que tambien se puede disenar una experiencia a medida.",
		"Si el visitante comparte un dato que completa una etapa mas adelantada, guardalo, pero no saltes los datos obligatorios anteriores del orden operativo.",
		"Captura un dato por vez y no preguntes varios campos en un solo mensaje.",
		"Orden operativo de captura: "+captureOrderText(bot)+".",
		"Campos de captura configurados en conocimiento: "+captureLeadCaptureText(bot)+".",
		"El telefono es obligatorio aunque el visitante no quiera llamadas; en ese caso aclara que es solo para WhatsApp. Nunca sustituyas el telefono por correo.",
		"El correo es util pero opcional; si el visitante no tiene o no quiere compartirlo, omitelo sin insistir y continua con el siguiente dato.",
		"Si el visitante ya compartio nombre, telefono o correo, no vuelvas a pedir ese dato.",
		"Si ya existe interes confirmado, reconoce ese contexto solo una vez y continua con el siguiente dato faltante sin repetir el itinerario salvo que el visitante lo pida.",
		"Antes del handoff procura capturar, uno por uno, cantidad de viajeros, fecha tentativa, motivo especial y mejor horario para contactar.",
		"Si el visitante rechaza seguimiento o dice que no desea continuar, agradece y cierra sin volver a ofrecer ayuda.",
		"Si la fecha tentativa supera tres anos desde hoy, tratala como una planeacion muy lejana y pregunta si busca costo, financiamiento o una fecha mas cercana.",
		"Si preguntan por precio, usa el precio base exacto del conocimiento y agrega solo una pregunta breve si hace falta.",
		"No inventes beneficios, condiciones, disponibilidad, promociones ni politicas fuera del conocimiento entregado.",
		"Si falta contexto, formula una sola pregunta clara. No pidas todos los datos en un mismo mensaje.",
		"Si el lead esta listo para handoff o pide asesor, confirma seguimiento humano con calma.",
		"Responde en 2 a 4 oraciones maximo y termina siempre la idea completa.",
		"Marca: "+bot.DisplayName,
		"Resumen del negocio: "+bot.Description,
		"Tone: "+bot.Tone,
		"Resumen de conocimiento: "+knowledgeSummary,
		"Conocimiento en Markdown:",
		"```markdown",
		knowledgeMarkdown,
		"```",
		"Ubicacion: "+firstNonEmpty(contact.Address, "sin ubicacion configurada"),
		"Contacto directo: "+firstNonEmpty(contact.PhoneDisplay, "sin telefono configurado")+" | "+firstNonEmpty(contact.Email, "sin correo configurado"),
		"Hint de pagina principal: "+firstNonEmpty(bot.PagePrincipalHint, "sin hint especifico"),
		"Lead actual: "+strings.Join(leadSummary, " | "),
		"Stage conversacional: "+string(conversation.Stage),
		"Resumen de conversacion: "+firstNonEmpty(conversation.Summary, "sin resumen"),
		"Fecha actual: "+now.UTC().Format("2006-01-02"),
		"Umbral de handoff: "+fmt.Sprintf("%d", handoffThreshold),
		"Ultimo mensaje del visitante: "+strings.TrimSpace(userMessage),
		"Guia operativa: "+firstNonEmpty(strings.TrimSpace(ruleGuide), "sin guia adicional"),
		"Use la guia operativa como contexto, no como texto para copiar.",
		"Redacte usted mismo la respuesta final con tono natural, humano y empatico.",
		"La respuesta final debe sentirse escrita por un asesor humano; no mencione reglas, guias internas, fuentes ni que esta siguiendo instrucciones.",
		"Cuida la ortografia en la respuesta final: usa ñ, acentos y signos correctos en todo momento.",
		"Si detectas intencion de compra o el lead esta completo, responde de forma breve y orientada al cierre.",
		"Si ya hay handoff requerido, confirma que un asesor dara seguimiento y pide el mejor horario de contacto.",
		"Si el usuario pregunta por ubicacion, telefono, WhatsApp o donde marcar, responde con el dato exacto de contacto y ubicacion que viene en el conocimiento de la marca.",
		"Si el usuario pregunta por fechas, valida que el dia exista y nunca sugieras anos pasados como opcion viable.",
		"Si el usuario dice que no tiene correo o no quiere compartirlo, no lo conviertas en bloqueo ni vuelvas a insistir en ese campo.",
	)

	promptMessages := make([]PromptMessage, 0, len(messages))
	for _, message := range messages {
		role := message.Role
		if role != domain.RoleAssistant && role != domain.RoleUser {
			continue
		}
		promptMessages = append(promptMessages, PromptMessage{
			Role:    role,
			Content: message.Content,
		})
	}

	return PromptRequest{
		SystemPrompt: systemPrompt,
		Messages:     promptMessages,
		MaxTokens:    420,
		Temperature:  0.4,
	}
}

func BuildResponseGuide(bot domain.BotKnowledge, conversation *domain.Conversation, lead *domain.Lead, userMessage string, now time.Time, handoff HandoffDecision) string {
	parts := make([]string, 0, 10)
	parts = append(parts, "Responder de forma breve, empatica y concreta al ultimo mensaje.")

	message := normalizeText(userMessage)
	switch {
	case isPricingQuestion(message):
		parts = append(parts, "El usuario pregunta por precio o costo.")
	case isItineraryCatalogQuestion(message):
		parts = append(parts, "El usuario pregunta que itinerarios o opciones existen.")
	case strings.Contains(message, "incluye"):
		parts = append(parts, "El usuario pregunta que incluye un viaje o itinerario.")
	case strings.Contains(message, "fecha") || strings.Contains(message, "salida") || strings.Contains(message, "disponib"):
		parts = append(parts, "El usuario pregunta por fechas, salidas o disponibilidad.")
	default:
		parts = append(parts, "El usuario puede estar dando un dato de captura o una duda abierta.")
	}

	if lead != nil {
		if name := strings.TrimSpace(lead.Name); name != "" {
			parts = append(parts, "Usa el nombre del lead si ayuda a sonar natural: "+name+".")
		}
		if interest := strings.TrimSpace(lead.Interest); interest != "" {
			parts = append(parts, "Interes actual: "+interest+".")
		}
	}

	nextField := nextMissingCaptureField(bot, lead, conversation)
	if nextField != "" {
		parts = append(parts, "Siguiente dato util: "+captureFieldLabel(nextField)+".")
	}

	if handoff.Required {
		parts = append(parts, "Si corresponde, confirma seguimiento humano sin sonar abrupto.")
	}

	if parsedDate, ok := travelDateBeyondPlanningHorizon(userMessage, now); ok {
		parts = append(parts, "Fecha lejana detectada: "+parsedDate.Format("2006-01-02")+". Trata la solicitud como planeacion muy anticipada.")
	}

	parts = append(parts, "Evita muletillas repetitivas. No copies frases fijas del sistema.")
	parts = append(parts, "Responde primero la duda del usuario y luego, si tiene sentido, avanza un solo paso.")
	parts = append(parts, "Fecha actual de referencia: "+now.UTC().Format("2006-01-02")+".")

	return strings.Join(parts, " ")
}

func BuildLeadExtractionPrompt(bot domain.BotKnowledge, lead *domain.Lead, userMessage string) PromptRequest {
	leadSummary := []string{
		"nombre=" + firstNonEmpty(lead.Name, "pendiente"),
		"telefono=" + firstNonEmpty(lead.Phone, "pendiente"),
		"correo=" + firstNonEmpty(lead.Email, "pendiente"),
		"fecha_tentativa=" + firstNonEmpty(lead.TravelDate, "pendiente"),
		"interes=" + firstNonEmpty(lead.Interest, "pendiente"),
		"viajeros=" + firstNonEmpty(lead.Travelers, "pendiente"),
		"motivo_especial=" + firstNonEmpty(lead.SpecialOccasion, "pendiente"),
		"mejor_horario=" + firstNonEmpty(lead.PreferredContactTime, "pendiente"),
	}

	systemPrompt := joinPromptSections(
		"Eres un extractor estricto de datos para un bot de viajes premium.",
		"Devuelve solo JSON valido, sin markdown, sin explicaciones y sin texto adicional.",
		"Esquema esperado: {\"updates\":{\"name\":\"\",\"email\":\"\",\"phone\":\"\",\"interest\":\"\",\"travelers\":\"\",\"travel_date\":\"\",\"special_occasion\":\"\",\"preferred_contact_time\":\"\"}}",
		"Completa solo los campos que el mensaje realmente exprese.",
		"No inventes datos ni rellenes campos por intuicion.",
		"No conviertas una duracion o disponibilidad de dias en travel_date.",
		"Si el mensaje mezcla varios datos, separalos correctamente.",
		"Si un dato ya existe en el lead y el mensaje no lo cambia con claridad, mantenlo igual.",
		"Campos permitidos: "+captureLeadCaptureText(bot)+".",
		"Orden operativo: "+captureOrderText(bot)+".",
		"Lead actual: "+strings.Join(leadSummary, " | "),
		"Mensaje del usuario: "+strings.TrimSpace(userMessage),
	)

	return PromptRequest{
		SystemPrompt: systemPrompt,
		Messages: []PromptMessage{
			{
				Role:    domain.RoleUser,
				Content: strings.TrimSpace(userMessage),
			},
		},
		MaxTokens:   220,
		Temperature: 0,
	}
}

func joinPromptSections(sections ...string) string {
	items := make([]string, 0, len(sections))
	for _, section := range sections {
		if trimmed := strings.TrimSpace(section); trimmed != "" {
			items = append(items, trimmed)
		}
	}
	return strings.Join(items, "\n")
}

func buildKnowledgeSummary(bot domain.BotKnowledge) string {
	items := []string{
		"slug=" + bot.Slug,
		"itinerarios=" + joinItineraryNames(bot.Itineraries),
		"faqs=" + fmt.Sprintf("%d", len(bot.FAQs)),
		"preguntas=" + fmt.Sprintf("%d", len(bot.QualificationQuestions)),
		"captura=" + captureLeadCaptureText(bot),
		"keywords=" + strings.Join(bot.Keywords, ", "),
		"destinos=" + strings.Join(bot.DestinationKeywords, ", "),
	}
	if len(bot.ClosingPrompts) > 0 {
		items = append(items, "cierre="+bot.ClosingPrompts[0])
	}
	if len(bot.Handoff.Triggers) > 0 {
		items = append(items, "handoff="+handoffTriggersText(bot))
	}
	if strings.TrimSpace(bot.PagePrincipalHint) != "" {
		items = append(items, "hint="+bot.PagePrincipalHint)
	}
	return strings.Join(items, " | ")
}

func buildKnowledgeMarkdown(bot domain.BotKnowledge, contact brandContact) string {
	var b strings.Builder

	displayName := firstNonEmpty(bot.DisplayName, bot.BrandName, bot.Slug)
	b.WriteString("# ")
	b.WriteString(displayName)
	b.WriteString("\n\n")

	if overview := strings.TrimSpace(bot.Overview); overview != "" {
		b.WriteString("## Resumen\n")
		b.WriteString(overview)
		b.WriteString("\n\n")
	}

	if len(bot.Itineraries) > 0 {
		b.WriteString("## Itinerarios\n")
		for _, itinerary := range bot.Itineraries {
			b.WriteString("### ")
			b.WriteString(itinerary.Name)
			b.WriteString("\n")
			if itinerary.Duration != "" {
				b.WriteString("- Duracion: ")
				b.WriteString(itinerary.Duration)
				b.WriteString("\n")
			}
			if itinerary.Summary != "" {
				b.WriteString("- Resumen: ")
				b.WriteString(itinerary.Summary)
				b.WriteString("\n")
			}
			if itinerary.IdealFor != "" {
				b.WriteString("- Ideal para: ")
				b.WriteString(itinerary.IdealFor)
				b.WriteString("\n")
			}
			if len(itinerary.Highlights) > 0 {
				b.WriteString("- Highlights: ")
				b.WriteString(strings.Join(itinerary.Highlights, ", "))
				b.WriteString("\n")
			}
			if itinerary.Price != "" {
				b.WriteString("- Precio base: ")
				b.WriteString(itinerary.Price)
				b.WriteString("\n")
			}
			b.WriteString("\n")
		}
	}

	if len(bot.FAQs) > 0 {
		b.WriteString("## FAQs\n")
		for _, faq := range bot.FAQs {
			b.WriteString("- ")
			b.WriteString(faq.Question)
			b.WriteString(" -> ")
			b.WriteString(faq.Answer)
			b.WriteString("\n")
		}
		b.WriteString("\n")
	}

	if len(bot.QualificationQuestions) > 0 {
		b.WriteString("## Calificacion\n")
		for _, question := range bot.QualificationQuestions {
			b.WriteString("- ")
			b.WriteString(question)
			b.WriteString("\n")
		}
		b.WriteString("\n")
	}

	b.WriteString("## Captura\n")
	if len(bot.LeadCapture) > 0 {
		b.WriteString("- Campos configurados: ")
		b.WriteString(captureLeadCaptureText(bot))
		b.WriteString("\n")
	}
	b.WriteString("- Orden operativo: ")
	b.WriteString(captureOrderText(bot))
	b.WriteString("\n\n")

	if len(bot.ClosingPrompts) > 0 {
		b.WriteString("## Cierre\n")
		for _, prompt := range bot.ClosingPrompts {
			b.WriteString("- ")
			b.WriteString(prompt)
			b.WriteString("\n")
		}
		b.WriteString("\n")
	}

	if len(bot.Keywords) > 0 || len(bot.DestinationKeywords) > 0 {
		b.WriteString("## Palabras Clave\n")
		if len(bot.Keywords) > 0 {
			b.WriteString("- Generales: ")
			b.WriteString(strings.Join(bot.Keywords, ", "))
			b.WriteString("\n")
		}
		if len(bot.DestinationKeywords) > 0 {
			b.WriteString("- Destinos: ")
			b.WriteString(strings.Join(bot.DestinationKeywords, ", "))
			b.WriteString("\n")
		}
		b.WriteString("\n")
	}

	b.WriteString("## Handoff\n")
	if len(bot.Handoff.Triggers) > 0 {
		b.WriteString("- Triggers: ")
		b.WriteString(handoffTriggersText(bot))
		b.WriteString("\n")
	}
	if bot.Handoff.ThresholdScore > 0 {
		b.WriteString("- Umbral: ")
		b.WriteString(fmt.Sprintf("%d", bot.Handoff.ThresholdScore))
		b.WriteString("\n")
	}
	if strings.TrimSpace(bot.Handoff.Reason) != "" {
		b.WriteString("- Motivo: ")
		b.WriteString(bot.Handoff.Reason)
		b.WriteString("\n")
	}
	if strings.TrimSpace(bot.Handoff.ClosingMessage) != "" {
		b.WriteString("- Cierre: ")
		b.WriteString(bot.Handoff.ClosingMessage)
		b.WriteString("\n")
	}
	b.WriteString("\n")

	b.WriteString("## Enrutamiento Principal\n")
	if strings.TrimSpace(bot.PagePrincipalHint) != "" {
		b.WriteString("- ")
		b.WriteString(bot.PagePrincipalHint)
		b.WriteString("\n")
	}
	b.WriteString("\n")

	b.WriteString("## Contacto\n")
	if contact.PhoneDisplay != "" {
		b.WriteString("- Telefono: ")
		b.WriteString(contact.PhoneDisplay)
		b.WriteString("\n")
	}
	if contact.Email != "" {
		b.WriteString("- Email: ")
		b.WriteString(contact.Email)
		b.WriteString("\n")
	}
	if contact.Address != "" {
		b.WriteString("- Ubicacion: ")
		b.WriteString(contact.Address)
		b.WriteString("\n")
	}

	return strings.TrimSpace(b.String())
}

func joinItineraryNames(items []domain.Itinerary) string {
	names := make([]string, 0, len(items))
	for _, item := range items {
		names = append(names, item.Name)
	}
	return strings.Join(names, ", ")
}
