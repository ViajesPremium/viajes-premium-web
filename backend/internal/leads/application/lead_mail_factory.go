package application

import (
	"fmt"
	"html"
	"strings"
	"time"

	"backend/internal/leads/domain"
)

// buildLeadEnvelope junta toda la informacion que el mail necesita antes de
// construir el correo final.
//
// De donde sale cada dato:
// - requestID: lo genera el handler/caso de uso para rastrear la peticion.
// - lead: viene del formulario o del mapeo interno del lead ya normalizado.
// - now: es la hora actual, usada para fecha y hora del correo.
//
// Que hace:
// - Resuelve el nombre legible de la landing a partir de PagePath.
// - Resuelve el canal segun FormID (WhatsApp vs formulario web).
// - Construye la directiva #tags que usan los flujos de CRM.
// - Calcula el Subject y tambien lo guarda dentro del lead.
// - Empaqueta todo en LeadEnvelope para que el resto del factory solo lea.
func buildLeadEnvelope(requestID string, lead domain.Lead, now time.Time) domain.LeadEnvelope {
	// Convierte el path de la pagina en una etiqueta comercial legible.
	landingLabel := NormalizeLandingSubjectLabel(lead.PagePath)

	// Decide si el lead entro por WhatsApp o por formulario normal.
	channel := getLeadChannel(lead.FormID)

	// Normaliza la etiqueta CRM para el cuerpo del correo y para integraciones.
	tagsDirective := buildTagsDirective(lead.CRMTag, landingLabel)

	// El Subject se construye aqui y se guarda dentro del lead para reutilizarlo.
	if lead.Priority == "" {
		lead.Priority = DerivePriorityFromTravelDate(lead.TravelDate, now)
	}
	lead.Subject = BuildNotificationSubject(landingLabel, SubjectSourceLabel(lead.FormID))

	return domain.LeadEnvelope{
		RequestID:     requestID,
		Lead:          lead,
		LandingLabel:  landingLabel,
		OriginDomain:  getOriginDomain(lead.PagePath),
		TagsDirective: tagsDirective,
		Channel:       channel,
		ChannelLabel:  channelLabel(channel),
		DateStamp:     now.In(mexicoCityLocation()).Format("02/01/2006"),
		TimeStamp:     now.In(mexicoCityLocation()).Format("15:04:05"),
	}
}

// buildLeadEmailMessage convierte el LeadEnvelope en el mensaje final que el
// mailer SMTP entiende.
//
// Este paso no consulta nada externo. Solo toma el envelope ya armado y lo
// transforma en:
// - ReplyTo: correo del lead
// - Subject: asunto ya calculado
// - TextBody: version plana del contenido
// - HTMLBody: version con tabla HTML
func buildLeadEmailMessage(envelope domain.LeadEnvelope) EmailMessage {
	return EmailMessage{
		ReplyTo:  envelope.Lead.Email,
		Subject:  envelope.Lead.Subject,
		TextBody: buildTextBody(envelope),
		HTMLBody: buildHTMLBody(envelope),
	}
}

// buildTextBody arma la version en texto plano del correo.
//
// Origen de los datos:
// - envelope.TagsDirective: sale de CRMTag o del nombre de la landing.
// - envelope.LandingLabel: se deduce desde PagePath.
// - envelope.OriginDomain: se deduce desde la landing.
// - lead.*: vienen del lead normalizado (nombre, telefono, correo, etc.).
// - lead.Attribution.*: vienen de la atribucion UTM/click IDs guardada en el lead.
// - envelope.DateStamp / TimeStamp: se calculan con la hora actual en CDMX.
func buildTextBody(envelope domain.LeadEnvelope) string {
	sections := buildLeadMailTextSections(envelope)
	lines := make([]string, 0, len(sections)+4)
	lines = append(lines, envelope.TagsDirective)
	lines = append(lines, fmt.Sprintf("Solicitud de Cotizacion %s", envelope.LandingLabel))
	lines = append(lines, envelope.LandingLabel)
	lines = append(lines, fmt.Sprintf("El usuario te ha enviado sus datos desde %s", envelope.OriginDomain))
	for _, section := range sections {
		lines = append(lines, section.title)
		lines = append(lines, section.lines...)
		lines = append(lines, "")
	}
	return strings.TrimSpace(strings.Join(lines, "\n"))
}

// buildHTMLBody arma la version HTML del correo.
//
// Usa exactamente la misma fuente de datos que buildTextBody, pero los presenta
// en una tabla HTML para que sea mas facil de leer en clientes de correo.
//
// Nota: todo valor que entra al HTML se escapa con escapeHTML para evitar que
// caracteres especiales rompan el markup.
func buildHTMLBody(envelope domain.LeadEnvelope) string {
	sections := buildLeadMailTextSections(envelope)

	var builder strings.Builder
	builder.WriteString(fmt.Sprintf("<h2>Solicitud de Cotizacion %s</h2>", escapeHTML(envelope.LandingLabel)))
	builder.WriteString(fmt.Sprintf("<p>%s</p>", escapeHTML(envelope.TagsDirective)))
	builder.WriteString(fmt.Sprintf("<p><strong>%s</strong></p>", escapeHTML(envelope.LandingLabel)))
	builder.WriteString(fmt.Sprintf("<p>El usuario te ha enviado sus datos desde %s</p>", escapeHTML(envelope.OriginDomain)))

	for _, section := range sections {
		builder.WriteString("<h3>")
		builder.WriteString(escapeHTML(section.title))
		builder.WriteString("</h3>")
		builder.WriteString(`<table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;width:100%;margin-bottom:16px;">`)
		for _, line := range section.lines {
			parts := strings.SplitN(line, ": ", 2)
			if len(parts) != 2 {
				continue
			}
			builder.WriteString(fmt.Sprintf(`<tr><th align="left">%s:</th><td>%s</td></tr>`, escapeHTML(parts[0]), escapeHTML(parts[1])))
		}
		builder.WriteString(`</table>`)
	}

	return builder.String()
}

// getLandingLabel convierte un PagePath como /japon-premium en una etiqueta
// comercial legible como "Japon PREMIUM".
//
// Si la ruta no coincide con ninguna landing conocida, devuelve "Viajes PREMIUM"
// como fallback seguro.
func getLandingLabel(pagePath string) string { return NormalizeLandingSubjectLabel(pagePath) }

// getOriginDomain resuelve el dominio visible en el correo segun la landing.
//
// No consulta DNS ni HTTP: solo traduce el slug de la ruta a un texto fijo para
// que el equipo identifique rapidamente desde donde entro el lead.
func getOriginDomain(pagePath string) string {
	switch getLandingIDFromPath(pagePath) {
	case "japon-premium":
		return "viajespremium.com.mx/japon-premium"
	case "corea-premium":
		return "viajespremium.com.mx/corea-premium"
	case "europa-premium":
		return "viajespremium.com.mx/europa-premium"
	case "canada-premium":
		return "viajespremium.com.mx/canada-premium"
	case "peru-premium":
		return "viajespremium.com.mx/peru-premium"
	case "chiapas-premium":
		return "viajespremium.com.mx/chiapas-premium"
	case "barrancas-premium":
		return "viajespremium.com.mx/barrancas-premium"
	case "yucatan-premium":
		return "viajespremium.com.mx/yucatan-premium"
	default:
		return "viajespremium.com.mx"
	}
}

// getLandingIDFromPath toma el primer segmento de la URL.
//
// Ejemplos:
// - "/japon-premium" -> "japon-premium"
// - "japon-premium/paquete" -> "japon-premium"
// - "" -> "viajes-premium"
func getLandingIDFromPath(pagePath string) string {
	cleaned := strings.TrimLeft(strings.TrimSpace(pagePath), "/")
	if cleaned == "" {
		return "viajes-premium"
	}
	parts := strings.Split(cleaned, "/")
	if len(parts) == 0 || parts[0] == "" {
		return "viajes-premium"
	}
	return parts[0]
}

// getLeadChannel decide si el lead llego por WhatsApp o por formulario web.
//
// La unica fuente de verdad aqui es FormID:
// - si empieza con "whatsapp-fab" -> WhatsApp
// - cualquier otro valor -> formulario web
func getLeadChannel(formID string) domain.Channel {
	if strings.HasPrefix(formID, "whatsapp-fab") {
		return domain.ChannelWhatsApp
	}
	return domain.ChannelWebForm
}

// channelLabel traduce el enum interno a una etiqueta legible para el correo.
func channelLabel(channel domain.Channel) string {
	if channel == domain.ChannelWhatsApp {
		return "WhatsApp"
	}
	return "Formulario Web"
}

// buildSubjectTag resuelve el fragmento #tags que se usa en el asunto y en la
// directiva del CRM.
//
// Prioridad de origen:
// 1. CRMTag que ya venga en el lead.
// 2. LandingLabel derivada del PagePath.
// 3. "Viajes PREMIUM" como fallback final.
func buildSubjectTag(rawCRMTag, landingLabel string) string {
	cleaned := strings.TrimSpace(rawCRMTag)
	if cleaned != "" {
		return cleaned
	}

	fallback := strings.TrimSpace(landingLabel)
	if fallback == "" {
		fallback = "Viajes PREMIUM"
	}

	return "#tags:" + fallback
}

// stripTagPrefix quita el prefijo #tags: para dejar solo el texto legible.
//
// Se usa para evitar repetir el prefijo cuando el asunto ya lleva la etiqueta.
func stripTagPrefix(value string) string {
	cleaned := strings.TrimSpace(value)
	if len(cleaned) >= len("#tags:") && strings.EqualFold(cleaned[:len("#tags:")], "#tags:") {
		return strings.TrimSpace(cleaned[len("#tags:"):])
	}
	return cleaned
}

// buildTagsDirective normaliza la instruccion de tags para la bandeja o CRM.
//
// Esta funcion asegura que el valor siempre salga con el prefijo "#tags:".
// Si el lead ya lo trae, se limpia para evitar duplicados.
func buildTagsDirective(rawCRMTag, landingLabel string) string {
	cleaned := strings.TrimSpace(rawCRMTag)
	if len(cleaned) >= len("#tags:") && strings.EqualFold(cleaned[:len("#tags:")], "#tags:") {
		cleaned = strings.TrimSpace(cleaned[len("#tags:"):])
	}
	if cleaned == "" {
		cleaned = landingLabel
	}
	return fmt.Sprintf("#tags: %s", cleaned)
}

// formatLine es una ayuda pequena para armar lineas "Etiqueta: valor" en texto plano.
func formatLine(label, value string) string {
	return fmt.Sprintf("%s: %s", label, value)
}

type leadMailSection struct {
	title string
	lines []string
}

func buildLeadMailTextSections(envelope domain.LeadEnvelope) []leadMailSection {
	lead := envelope.Lead
	sourceLabel := SubjectSourceLabel(lead.FormID)

	contactLines := make([]string, 0, 6)
	contactLines = appendLineIfValue(contactLines, "Nombre", lead.Name)
	contactLines = appendLineIfValue(contactLines, "Telefono", lead.Phone)
	contactLines = appendLineIfValue(contactLines, "Correo", lead.Email)
	contactLines = appendLineIfValue(contactLines, "Formulario", lead.FormID)
	contactLines = appendLineIfValue(contactLines, "Pagina", lead.PagePath)

	detailLines := make([]string, 0, 6)
	detailLines = appendLineIfValue(detailLines, "Landing slug", lead.Attribution.LandingSlug)
	detailLines = appendLineIfValue(detailLines, "Destino", lead.Attribution.Destination)
	detailLines = appendLineIfValue(detailLines, "Fecha tentativa", lead.TravelDate)
	if strings.TrimSpace(lead.TravelDate) != "" {
		detailLines = appendLineIfValue(detailLines, "Prioridad", lead.Priority)
	}
	detailLines = appendLineIfValue(detailLines, "Viajeros", lead.Travelers)
	detailLines = appendLineIfValue(detailLines, "Interes", lead.TravelWishes)
	detailLines = appendLineIfValue(detailLines, "Tipo de experiencia", lead.ExperienceType)

	attributionLines := make([]string, 0, 7)
	attributionLines = appendLineIfValue(attributionLines, "CRM Tag", firstNonEmpty(lead.CRMTag, envelope.TagsDirective))
	attributionLines = appendLineIfValue(attributionLines, "UTM Source", lead.Attribution.UTMSource)
	attributionLines = appendLineIfValue(attributionLines, "UTM Medium", lead.Attribution.UTMMedium)
	attributionLines = appendLineIfValue(attributionLines, "UTM Campaign", lead.Attribution.UTMCampaign)
	attributionLines = appendLineIfValue(attributionLines, "UTM Content", lead.Attribution.UTMContent)
	attributionLines = appendLineIfValue(attributionLines, "UTM Term", lead.Attribution.UTMTerm)
	attributionLines = appendLineIfValue(attributionLines, "FBCLID", lead.Attribution.FBCLID)
	attributionLines = appendLineIfValue(attributionLines, "Referrer", lead.Attribution.Referrer)

	timestampLines := []string{
		formatLine("Fecha", envelope.DateStamp),
		formatLine("Hora", envelope.TimeStamp),
	}

	sections := []leadMailSection{}

	switch sourceLabel {
	case "Primer Formulario":
		sections = append(sections,
			leadMailSection{title: "Captura inicial", lines: contactLines},
			leadMailSection{title: "Preferencias compartidas", lines: detailLines},
		)
	case "Segundo Formulario":
		sections = append(sections,
			leadMailSection{title: "Formulario de cotizacion", lines: contactLines},
			leadMailSection{title: "Datos de viaje", lines: detailLines},
		)
	case "Whatsapp":
		sections = append(sections,
			leadMailSection{title: "Contacto por WhatsApp", lines: contactLines},
			leadMailSection{title: "Datos compartidos", lines: detailLines},
		)
	default:
		sections = append(sections,
			leadMailSection{title: "Datos del lead", lines: contactLines},
			leadMailSection{title: "Contexto comercial", lines: detailLines},
		)
	}

	if len(attributionLines) > 0 {
		sections = append(sections, leadMailSection{title: "Atribucion", lines: attributionLines})
	}
	sections = append(sections, leadMailSection{title: "Marca temporal", lines: timestampLines})

	filtered := make([]leadMailSection, 0, len(sections))
	for _, section := range sections {
		if len(section.lines) == 0 {
			continue
		}
		filtered = append(filtered, section)
	}
	return filtered
}

func appendLineIfValue(lines []string, label, value string) []string {
	if strings.TrimSpace(value) == "" {
		return lines
	}
	return append(lines, formatLine(label, value))
}

// escapeHTML evita que valores del lead rompan el HTML del correo.
//
// Esto es importante porque campos como nombre, pagina o referrer pueden traer
// caracteres especiales como <, >, & o comillas.
func escapeHTML(value string) string {
	return html.EscapeString(value)
}

// mexicoCityLocation devuelve la zona horaria usada para fechas legibles del correo.
//
// Si por alguna razon no se puede cargar "America/Mexico_City", cae a una zona
// fija CST (-6) para no romper la construccion del correo.
func mexicoCityLocation() *time.Location {
	location, err := time.LoadLocation("America/Mexico_City")
	if err != nil {
		return time.FixedZone("CST", -6*60*60)
	}
	return location
}
