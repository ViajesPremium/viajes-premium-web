package application

import (
	"fmt"
	"strings"
)

func BuildNotificationSubject(landingLabel, sourceLabel string) string {
	landing := strings.TrimSpace(landingLabel)
	if landing == "" {
		landing = "Viajes PREMIUM"
	}

	source := strings.TrimSpace(sourceLabel)
	if source == "" {
		source = "Formulario Web"
	}

	return fmt.Sprintf("Cotización LP %s ® %s", landing, source)
}

func SubjectSourceLabel(formID string) string {
	switch {
	case strings.HasPrefix(strings.TrimSpace(formID), "first-form"):
		return "Primer Formulario"
	case strings.HasPrefix(strings.TrimSpace(formID), "second-form"):
		return "Segundo Formulario"
	case strings.HasPrefix(strings.TrimSpace(formID), "whatsapp-fab"):
		return "Whatsapp"
	default:
		return "Formulario Web"
	}
}

func NormalizeLandingSubjectLabel(value string) string {
	switch getLandingIDFromPath(value) {
	case "japon-premium":
		return "Japón PREMIUM"
	case "corea-premium":
		return "Corea PREMIUM"
	case "europa-premium":
		return "Europa PREMIUM"
	case "canada-premium":
		return "Canadá PREMIUM"
	case "peru-premium":
		return "Perú PREMIUM"
	case "chiapas-premium":
		return "Chiapas PREMIUM"
	case "barrancas-premium":
		return "Barrancas PREMIUM"
	case "yucatan-premium":
		return "Yucatán PREMIUM"
	default:
		return "Viajes PREMIUM"
	}
}
