package application

import (
	"fmt"
	"strconv"
	"strings"
	"time"

	leadmail "backend/internal/leads/application"
)

type brandContact struct {
	PhoneDisplay string
	PhoneLink    string
	Email        string
	Address      string
}

func brandContactInfo(botSlug string) brandContact {
	switch normalizeSlug(botSlug) {
	case "japon-premium":
		return brandContact{
			PhoneDisplay: "+52 55 4161 9428",
			PhoneLink:    "+525541619428",
			Email:        "reservaciones@viajespremium.com.mx",
			Address:      "Cda. de Omega 306, Romero de Terreros, Coyoacan, 04310 Ciudad de Mexico, CDMX",
		}
	case "europa-premium":
		return brandContact{
			PhoneDisplay: "+52 55 4161 9427",
			PhoneLink:    "+525541619427",
			Email:        "reservaciones@viajespremium.com.mx",
			Address:      "Cda. de Omega 306, Romero de Terreros, Coyoacan, 04310 Ciudad de Mexico, CDMX",
		}
	default:
		return brandContact{
			PhoneDisplay: "+52 55 9763 3210",
			PhoneLink:    "+525597633210",
			Email:        "reservaciones@viajespremium.com.mx",
			Address:      "Cda. de Omega 306, Romero de Terreros, Coyoacan, 04310 Ciudad de Mexico, CDMX",
		}
	}
}

func isContactQuestion(message string) bool {
	normalized := normalizeText(message)
	return containsAny(normalized, []string{
		"telefono",
		"numero de telefono",
		"numero telefonico",
		"whatsapp",
		"marcar",
		"llamar",
		"contacto",
		"correo",
		"email",
	})
}

func isLocationQuestion(message string) bool {
	normalized := normalizeText(message)
	return containsAny(normalized, []string{
		"donde estan",
		"donde se ubican",
		"ubicados",
		"ubicacion",
		"direccion",
		"oficina",
		"sucursal",
		"en donde estan",
	})
}

func isDateQuestion(message string) bool {
	normalized := normalizeText(message)
	if looksLikePhoneAttempt(message) {
		return false
	}

	if _, ok := detectYearFromNumbers(extractNumbers(message)); ok {
		return true
	}

	return containsAny(normalized, []string{
		"fecha",
		"fechas",
		"mes",
		"meses",
		"diciembre",
		"enero",
		"febrero",
		"marzo",
		"abril",
		"mayo",
		"junio",
		"julio",
		"agosto",
		"septiembre",
		"setiembre",
		"octubre",
		"noviembre",
	})
}
func isPricingQuestion(message string) bool {
	return containsAny(message, []string{
		"precio",
		"precios",
		"costo",
		"costos",
		"cotiz",
		"cuanto vale",
		"cuanto cuesta",
		"tarifa",
	})
}

func isItineraryCatalogQuestion(message string) bool {
	if !looksLikeQuestion(message) {
		return false
	}
	if isPricingQuestion(message) {
		return false
	}

	return containsAny(message, []string{
		"itinerarios",
		"itinerario",
		"opciones",
		"opcion",
		"que tienen",
		"que ofrecen",
		"cuales tienen",
		"cuales son",
		"paquetes",
		"experiencias tienen",
	})
}

func dateGuardResponse(now time.Time, message string) (string, bool) {
	normalized := normalizeText(message)
	if looksLikePhoneAttempt(normalized) {
		return "", false
	}
	if !isDateQuestion(normalized) {
		return "", false
	}

	if _, ok := leadmail.ParseTravelDate(message, now); ok {
		return "", false
	}

	numbers := extractNumbers(normalized)
	if year, ok := detectYearFromNumbers(numbers); ok {
		currentYear := now.Year()
		if year < currentYear {
			return fmt.Sprintf("Ese ano ya paso. Si desea, le ayudo a revisar una fecha vigente para %d o %d.", currentYear, currentYear+1), true
		}
		if year >= currentYear+4 {
			return fmt.Sprintf("Si se refiere a %d, es una planeacion muy lejana. Si lo que busca es conocer costo o un plan de financiamiento, con gusto lo revisamos; si no, conviene revisar una fecha mas cercana. ¿Le interesa presupuesto, financiamiento o cambiar la fecha?", year), true
		}
		if !hasMonthName(normalized) {
			return fmt.Sprintf("Si se refiere a %d, con gusto. Diga el mes y el dia para revisarlo con precision.", year), true
		}
	}

	if invalidDay, ok := detectInvalidDay(numbers); ok {
		return fmt.Sprintf("El dia %d no existe en un mes como diciembre o en cualquier otro mes. Si le parece, le ayudo a revisar una fecha valida dentro del mes que prefiera.", invalidDay), true
	}

	if containsAny(normalized, []string{"siguiente ano", "proximo ano"}) {
		nextYear := now.Year() + 1
		return fmt.Sprintf("Si se refiere al siguiente ano, con gusto lo revisamos para %d. Diga el mes y el dia que tiene en mente.", nextYear), true
	}

	return "", false
}

func travelDateBeyondPlanningHorizon(message string, now time.Time) (time.Time, bool) {
	parsed, ok := leadmail.ParseTravelDate(message, now)
	if !ok {
		return time.Time{}, false
	}

	return parsed, parsed.After(now.AddDate(3, 0, 0))
}

func followupOptOutIntent(message string) bool {
	return containsAny(message, []string{
		"no quiero seguimiento",
		"no quiero nada",
		"ya no quiero nada",
		"ya no quiero",
		"no quiero continuar",
		"no deseo seguimiento",
		"sin seguimiento",
		"no me contacte",
		"no me contacten",
		"no me llame",
		"no me llamen",
		"no me escriba",
		"no me escriban",
		"mejor me voy",
		"me voy a ir",
		"ya no gracias",
		"basta",
		"ya estuvo",
	})
}

func emailDeclinedIntent(message string) bool {
	return containsAny(message, []string{
		"no tengo correo",
		"no tengo email",
		"no uso correo",
		"no uso email",
		"prefiero no compartir correo",
		"prefiero no compartir email",
		"no quiero compartir correo",
		"no quiero compartir email",
		"no me comparta correo",
		"no me comparta email",
		"correo no tengo",
		"email no tengo",
		"sin correo",
	})
}

func hasMonthName(message string) bool {
	return containsAny(message, []string{
		"diciembre",
		"enero",
		"febrero",
		"marzo",
		"abril",
		"mayo",
		"junio",
		"julio",
		"agosto",
		"septiembre",
		"setiembre",
		"octubre",
		"noviembre",
	})
}

func extractNumbers(message string) []int {
	fields := strings.FieldsFunc(message, func(r rune) bool {
		return r < '0' || r > '9'
	})
	values := make([]int, 0, len(fields))
	for _, field := range fields {
		if field == "" {
			continue
		}
		value, err := strconv.Atoi(field)
		if err != nil {
			continue
		}
		values = append(values, value)
	}
	return values
}

func detectYearFromNumbers(numbers []int) (int, bool) {
	for _, value := range numbers {
		if value >= 1900 {
			return value, true
		}
	}
	return 0, false
}

func detectInvalidDay(numbers []int) (int, bool) {
	for _, value := range numbers {
		if value > 31 && value < 100 {
			return value, true
		}
	}
	return 0, false
}
