package application

import (
	"fmt"
	"regexp"
	"strconv"
	"strings"
	"time"
	"unicode"

	"backend/internal/chat/domain"
	"golang.org/x/text/unicode/norm"
)

var (
	emailPattern     = regexp.MustCompile(`(?i)[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}`)
	phonePattern     = regexp.MustCompile(`(?i)(\+?\d[\d\s().-]{7,}\d)`)
	amPmPattern      = regexp.MustCompile(`(?i)\b(?:am|pm)\b`)
	namePattern1     = regexp.MustCompile("(?i)(?:me llamo|mi nombre es|soy)\\s+([A-Za-zÃƒâ‚¬-ÃƒÂ¿'\\- ]{2,})")
	namePattern2     = regexp.MustCompile("(?i)^([A-Za-zÃƒâ‚¬-ÃƒÂ¿'\\-]{2,}(?:\\s+[A-Za-zÃƒâ‚¬-ÃƒÂ¿'\\-]{2,}){0,3})$")
	travelersPattern = regexp.MustCompile(`(?i)\b(\d{1,2}\s*(?:viajeros?|personas?|pasajeros?|adultos?|adulto|ninos?|niÃƒÂ±os?|menores?)|somos\s+\d{1,2}|viajamos\s+\d{1,2}|vamos\s+\d{1,2})\b`)
	timePattern      = regexp.MustCompile(`(?i)\b(?:\d{1,2}:\d{2}\s*(?:am|pm|hrs?|h)?|\d{1,2}\s*(?:am|pm|hrs?|h))\b`)
	datePattern      = regexp.MustCompile(`\b\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?\b`)
)

func detectEmail(message string) string {
	if match := emailPattern.FindString(strings.TrimSpace(message)); match != "" {
		return strings.ToLower(strings.TrimSpace(match))
	}
	return ""
}

func detectPhone(message string) string {
	candidate, ok := phoneCandidateFromMessage(message)
	if !ok || !isValidPhoneCandidate(candidate) {
		return ""
	}

	return candidate
}

func detectName(message string) string {
	cleaned := strings.TrimSpace(message)
	if cleaned == "" {
		return ""
	}

	if match := namePattern1.FindStringSubmatch(cleaned); len(match) > 1 {
		return strings.TrimSpace(match[1])
	}

	if match := regexp.MustCompile(`^([\pL][\pL'\-]{1,}(?:\s+[\pL'\-]{2,}){0,3})\s*[,;:-]\s+.+$`).FindStringSubmatch(cleaned); len(match) > 1 {
		candidate := strings.TrimSpace(match[1])
		if !isSuspiciousNameCandidate(candidate) && namePattern2.MatchString(candidate) {
			return candidate
		}
	}

	if isSuspiciousNameCandidate(cleaned) {
		return ""
	}

	if match := namePattern2.FindStringSubmatch(cleaned); len(match) > 1 {
		return strings.TrimSpace(match[1])
	}
	return ""
}

func isSuspiciousNameCandidate(value string) bool {
	lower := normalizeText(value)
	suspicious := []string{"@", "http", "www", "precio", "cotizacion", "fechas", "telefono", "tel", "hola", "buenas", "buenos", "gracias", "interes", "interesa", "quiero", "viaje", "viajar", "itinerario", "itinerarios", "japon", "europa", "corea", "canada", "peru", "chiapas", "yucatan", "barrancas", "chepe", "hokkaido", "shibuya", "anime", "manga", "serie", "series", "pelicula", "peliculas"}
	for _, needle := range suspicious {
		if strings.Contains(lower, needle) {
			return true
		}
	}
	return false
}

func detectInterest(bot domain.BotKnowledge, normalizedMessage string) string {
	for _, itinerary := range bot.Itineraries {
		if strings.Contains(normalizedMessage, normalizeText(itinerary.Name)) {
			return itinerary.Name
		}
		for _, highlight := range itinerary.Highlights {
			if strings.Contains(normalizedMessage, normalizeText(highlight)) {
				return itinerary.Name
			}
		}
	}

	if containsAny(normalizedMessage, []string{"shibuya", "anime", "manga", "pelicula", "peliculas", "serie", "series", "tokio"}) {
		return "Japon Pop"
	}

	if containsAny(normalizedMessage, []string{"hokkaido", "aohkaido"}) {
		return "Hokkaido"
	}

	for _, keyword := range bot.DestinationKeywords {
		if strings.Contains(normalizedMessage, normalizeText(keyword)) {
			return titleCase(keyword)
		}
	}

	return ""
}

func detectTravelers(message string) string {
	cleaned := strings.TrimSpace(message)
	if cleaned == "" || looksLikeQuestion(cleaned) {
		return ""
	}

	normalized := normalizeText(cleaned)
	if value := leadingTravelerCount(cleaned); value != "" {
		return value
	}
	switch {
	case travelersPattern.MatchString(cleaned):
		if value := extractTravelerCount(cleaned); value != "" {
			return value
		}
		return ""
	case regexp.MustCompile(`^\d{1,2}$`).MatchString(cleaned):
		return cleaned
	case normalized == "solo" || normalized == "sola":
		return "1"
	case containsAny(normalized, []string{
		"viajo solo",
		"voy solo",
		"viaja solo",
		"viajo sola",
		"voy sola",
		"viaja sola",
		"yo solo",
		"yo sola",
		"solo yo",
		"solos",
		"solas",
	}):
		if value := extractTravelerCount(cleaned); value != "" {
			return value
		}
		return "1"
	case containsAny(normalized, []string{"pareja", "familia", "amigos", "amigas", "hermano", "hermana", "esposo", "esposa", "hijo", "hija", "amigo", "amiga", "padre", "madre"}):
		if value := extractTravelerCount(cleaned); value != "" {
			return value
		}
		if value := detectCompanionListTravelers(normalized); value != "" {
			return value
		}
		return ""
	}

	return ""
}

func detectCompanionListTravelers(normalized string) string {
	if normalized == "" {
		return ""
	}

	companionPattern := regexp.MustCompile(`\b(?:mi|mis|con)?\s*(?:hermano|hermana|esposo|esposa|pareja|amigo|amiga|hijo|hija|padre|madre|mama|papa|novio|novia|abuelo|abuela|tio|tia|primo|prima|sobrino|sobrina|cunado|cunada|yerno|nuera)\b`)
	matches := companionPattern.FindAllString(normalized, -1)
	if len(matches) == 0 {
		return ""
	}

	total := len(matches)
	if containsAny(normalized, []string{" yo ", " yo,", " yo.", " yo;", " y yo", " conmigo"}) {
		total++
	} else if containsAny(normalized, []string{"somos", "seremos", "viajamos", "vamos", "viajo", "voy", "viaja", "viajare", "viajaremos", "viajaré", "viajaremos"}) {
		total++
	}

	if total <= 0 {
		return ""
	}

	return strconv.Itoa(total)
}

func leadingTravelerCount(message string) string {
	cleaned := normalizeText(strings.TrimSpace(message))
	if cleaned == "" {
		return ""
	}

	if match := regexp.MustCompile(`^(?:somos|seremos|viajamos|vamos|viaja|viajo|voy)?\s*(\d{1,2})\s*[,;:-]`).FindStringSubmatch(cleaned); len(match) > 1 {
		return match[1]
	}

	if match := regexp.MustCompile(`^(\d{1,2})\s*[,;:-]\s*.+`).FindStringSubmatch(cleaned); len(match) > 1 {
		return match[1]
	}

	if containsAny(cleaned, []string{"mi hermano y yo", "mi hermana y yo", "mi pareja y yo", "mi esposo y yo", "mi esposa y yo", "mi amigo y yo", "mi amiga y yo", "mi hijo y yo", "mi hija y yo", "mi padre y yo", "mi madre y yo"}) {
		return "2"
	}

	return ""
}

func extractTravelerCount(message string) string {
	normalized := normalizeText(message)
	countPatterns := []*regexp.Regexp{
		regexp.MustCompile(`(?i)\b(?:somos|seremos|viajamos|vamos|viaja|viajo|voy)\s+(\d{1,2})\b`),
		regexp.MustCompile(`(?i)\b(\d{1,2})\s*(?:viajeros?|personas?|pasajeros?|adultos?|adulto|ninos?|niños?|menores?)\b`),
		regexp.MustCompile(`(?i)\b(?:viajero|persona|pasajero|adulto|nino|niño|menor)s?\s+(\d{1,2})\b`),
	}

	for _, pattern := range countPatterns {
		if match := pattern.FindStringSubmatch(normalized); len(match) > 1 {
			return match[1]
		}
	}

	if strings.Contains(normalized, "pareja") {
		return "2"
	}
	if strings.Contains(normalized, "triple") || strings.Contains(normalized, "doble") {
		return "2"
	}

	return ""
}

func detectPreferredContactTime(message string) string {
	cleaned := strings.TrimSpace(message)
	if cleaned == "" || looksLikeQuestion(cleaned) {
		return ""
	}

	normalized := normalizeText(cleaned)
	compact := compactText(normalized)
	if value := normalizePreferredContactTimeASCII(cleaned); value != "" {
		return value
	}
	if containsAny(normalized, []string{"dias", "dia", "dias solamente", "dias nada mas", "dias unicamente", "solamente", "solo tengo", "dispongo de"}) &&
		!containsAny(normalized, []string{"hora", "horario", "tarde", "noche", "manana", "mediodia"}) {
		return ""
	}
	if timePattern.MatchString(cleaned) {
		return normalizePreferredContactTime(cleaned)
	}
	if amPmPattern.MatchString(cleaned) {
		return normalizePreferredContactTime(cleaned)
	}
	if regexp.MustCompile(`(?i)\b(?:a\s+las?|sobre\s+las?|aproximadamente\s+a\s+las?|alrededor\s+de\s+las?|despues\s+de\s+las?|después\s+de\s+las?)\s*\d{1,2}(?:[:.]\d{2})?\s*(?:am|pm)?\b`).MatchString(cleaned) {
		return normalizePreferredContactTime(cleaned)
	}
	if regexp.MustCompile(`(?i)\b\d{1,2}\s*(?:de\s+la\s+|de\s+las\s+)?(?:tarde|noche|manana|mediodia)\b`).MatchString(cleaned) {
		return normalizePreferredContactTime(cleaned)
	}
	if containsAny(normalized, []string{
		"manana", "mañana", "tarde", "noche", "mediodia", "medio dia",
		"despues", "después", "antes de", "entre", "horario", "hora",
		"cualquier hora", "sin problema de horario",
	}) {
		return normalizePreferredContactTime(cleaned)
	}
	if containsAny(compact, []string{"alas", "sobrelas", "aproximadamentealas", "alrededorde"}) && regexp.MustCompile(`\b\d{1,2}\b`).MatchString(compact) {
		return normalizePreferredContactTime(cleaned)
	}

	return ""
}

func detectTravelDate(message string, now time.Time) string {
	cleaned := strings.TrimSpace(message)
	if cleaned == "" || looksLikeQuestion(cleaned) || looksLikePhoneAttempt(cleaned) {
		return ""
	}

	normalized := normalizeText(cleaned)
	if datePattern.MatchString(cleaned) || hasMonthName(normalized) {
		return cleaned
	}
	if detectDateIntent(normalized) {
		return cleaned
	}
	if containsAny(normalized, []string{"fin de ano", "fin de a\u00f1o", "semana santa", "navidad", "ano nuevo", "a\u00f1o nuevo", "vacaciones de verano"}) {
		return cleaned
	}

	return ""
}

func detectSpecialOccasion(message string) string {
	cleaned := strings.TrimSpace(message)
	if cleaned == "" || looksLikeQuestion(cleaned) {
		return ""
	}

	normalized := normalizeText(cleaned)
	compact := compactText(normalized)
	if containsAny(normalized, []string{
		"cumple", "aniversario", "luna de miel", "boda", "pedida",
		"graduacion", "graduacion", "retiro", "jubila", "celebra",
		"festej", "romantic", "romant",
	}) {
		return cleaned
	}
	if containsAny(compact, []string{"cumple", "aniversario", "lunademiel", "boda", "pedida", "graduacion", "retiro", "jubila", "celebra", "festej", "romantic", "romant"}) {
		return cleaned
	}

	if cleaned == "no" || cleaned == "ninguno" || cleaned == "ninguna" {
		return "Sin motivo especial"
	}
	if containsAny(normalized, []string{"no en especial", "sin especial", "sin motivo especial", "ningun motivo", "ningun motivo especial", "solo conocer", "solo disfrutar", "solo conocer y disfrutar", "solo por conocer", "solo por disfrutar", "solo para conocer", "solo vacaciones", "solo descansar"}) {
		return "Sin motivo especial"
	}

	return ""
}

func shouldReplaceInterest(current, next string, bot domain.BotKnowledge) bool {
	if strings.TrimSpace(next) == "" {
		return false
	}
	if strings.TrimSpace(current) == "" {
		return true
	}
	if isKnownItineraryInterest(current, bot) {
		return false
	}
	if isKnownItineraryInterest(next, bot) {
		return true
	}
	return false
}

func isKnownItineraryInterest(value string, bot domain.BotKnowledge) bool {
	normalized := normalizeText(value)
	for _, itinerary := range bot.Itineraries {
		if strings.Contains(normalized, normalizeText(itinerary.Name)) {
			return true
		}
	}
	return false
}

func detectDateIntent(normalized string) bool {
	if _, ok := detectYearFromNumbers(extractNumbers(normalized)); ok {
		return true
	}
	return containsAny(normalized, []string{
		"fecha", "fechas", "mes", "meses", "proximo ano", "prÃƒÂ³ximo aÃƒÂ±o",
		"siguiente ano", "siguiente aÃƒÂ±o", "temporada", "salida", "salidas",
	})
}

func looksLikeQuestion(message string) bool {
	normalized := normalizeText(strings.TrimSpace(message))
	if strings.Contains(message, "?") {
		return true
	}
	return regexp.MustCompile(`(?i)^(?:que|cual|como|cuando|donde|puede|puedes|podria|podrias|me puede|me puedes|me podria|me podrias)\b`).MatchString(normalized)
}

func phoneCandidateFromMessage(message string) (string, bool) {
	raw := phonePattern.FindString(strings.TrimSpace(message))
	if raw == "" {
		return "", false
	}

	builder := strings.Builder{}
	for _, r := range raw {
		if unicode.IsDigit(r) || r == '+' {
			builder.WriteRune(r)
		}
	}

	value := builder.String()
	if value == "" {
		return "", false
	}
	return value, true
}

func phoneDigitsOnly(value string) string {
	builder := strings.Builder{}
	for _, r := range value {
		if unicode.IsDigit(r) {
			builder.WriteRune(r)
		}
	}
	return builder.String()
}

func isValidPhoneCandidate(value string) bool {
	digits := phoneDigitsOnly(value)
	if len(digits) < 10 || len(digits) > 15 {
		return false
	}

	if allDigitsEqual(digits) {
		return false
	}

	if countUniqueDigits(digits) < 3 {
		return false
	}

	return true
}

func allDigitsEqual(value string) bool {
	if value == "" {
		return false
	}
	first := value[0]
	for i := 1; i < len(value); i++ {
		if value[i] != first {
			return false
		}
	}
	return true
}

func countUniqueDigits(value string) int {
	seen := map[rune]struct{}{}
	for _, r := range value {
		seen[r] = struct{}{}
	}
	return len(seen)
}

func looksLikePhoneAttempt(message string) bool {
	_, ok := phoneCandidateFromMessage(message)
	return ok
}

func isInvalidPhoneAttempt(message string) bool {
	candidate, ok := phoneCandidateFromMessage(message)
	if !ok {
		return false
	}
	return !isValidPhoneCandidate(candidate)
}

func normalizeText(value string) string {
	value = strings.ToLower(strings.TrimSpace(value))
	return normalizeTextASCII(value)
	replacer := strings.NewReplacer(
		"ÃƒÂ¡", "a",
		"ÃƒÂ©", "e",
		"ÃƒÂ­", "i",
		"ÃƒÂ³", "o",
		"ÃƒÂº", "u",
		"ÃƒÂ ", "a",
		"ÃƒÂ¨", "e",
		"ÃƒÂ¬", "i",
		"ÃƒÂ²", "o",
		"ÃƒÂ¹", "u",
		"ÃƒÂ¤", "a",
		"ÃƒÂ«", "e",
		"ÃƒÂ¯", "i",
		"ÃƒÂ¶", "o",
		"ÃƒÂ¼", "u",
		"ÃƒÂ±", "n",
		"ÃƒÆ’Ã‚Â¡", "a",
		"ÃƒÆ’Ã‚Â©", "e",
		"ÃƒÆ’Ã‚Â­", "i",
		"ÃƒÆ’Ã‚Â³", "o",
		"ÃƒÆ’Ã‚Âº", "u",
		"ÃƒÆ’Ã‚Â ", "a",
		"ÃƒÆ’Ã‚Â¨", "e",
		"ÃƒÆ’Ã‚Â¬", "i",
		"ÃƒÆ’Ã‚Â²", "o",
		"ÃƒÆ’Ã‚Â¹", "u",
		"ÃƒÆ’Ã‚Â¤", "a",
		"ÃƒÆ’Ã‚Â«", "e",
		"ÃƒÆ’Ã‚Â¯", "i",
		"ÃƒÆ’Ã‚Â¶", "o",
		"ÃƒÆ’Ã‚Â¼", "u",
		"ÃƒÆ’Ã‚Â±", "n",
		"ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡", "a",
		"ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©", "e",
		"ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­", "i",
		"ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³", "o",
		"ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âº", "u",
		"ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â ", "a",
		"ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¨", "e",
		"ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¬", "i",
		"ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â²", "o",
		"ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¹", "u",
		"ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤", "a",
		"ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â«", "e",
		"ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¯", "i",
		"ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶", "o",
		"ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¼", "u",
		"ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â±", "n",
	)
	return replacer.Replace(value)
}

func normalizeTextASCII(value string) string {
	if value == "" {
		return ""
	}

	decomposed := norm.NFD.String(value)
	var b strings.Builder
	b.Grow(len(decomposed))
	lastSpace := false
	for _, r := range decomposed {
		switch {
		case unicode.Is(unicode.Mn, r):
			continue
		case unicode.IsLetter(r) || unicode.IsDigit(r):
			b.WriteRune(r)
			lastSpace = false
		case unicode.IsSpace(r):
			if !lastSpace {
				b.WriteByte(' ')
				lastSpace = true
			}
		}
	}
	return strings.TrimSpace(b.String())
}

func compactText(value string) string {
	return strings.ReplaceAll(strings.TrimSpace(value), " ", "")
}

func normalizedSpace(value string) string {
	return strings.Join(strings.Fields(strings.TrimSpace(value)), " ")
}

func normalizePreferredContactTimeASCII(value string) string {
	cleaned := normalizeText(value)
	if cleaned == "" {
		return ""
	}

	hourPattern := regexp.MustCompile(`(?i)\b(?:a\s+las?|sobre\s+las?|aproximadamente\s+a\s+las?|alrededor\s+de\s+las?|despues\s+de\s+las?)\s*(\d{1,2})(?:[:.](\d{2}))?\s*(am|pm)?\b`)
	if match := hourPattern.FindStringSubmatch(cleaned); len(match) > 1 {
		hour, err := strconv.Atoi(match[1])
		if err == nil {
			minutes := "00"
			if len(match) > 2 && match[2] != "" {
				minutes = match[2]
			}
			suffix := ""
			if len(match) > 3 {
				suffix = strings.ToLower(strings.TrimSpace(match[3]))
			}
			if suffix == "pm" && hour < 12 {
				hour += 12
			}
			if suffix == "am" && hour == 12 {
				hour = 0
			}
			prefix := "a las"
			if strings.Contains(cleaned, "despues") || strings.Contains(cleaned, "sobre") || strings.Contains(cleaned, "alrededor") {
				prefix = "despues de las"
			}
			return fmt.Sprintf("%s %02d:%s", prefix, hour, minutes)
		}
	}

	if containsAny(cleaned, []string{"tarde", "noche", "manana", "mediodia", "medio dia"}) {
		return cleaned
	}

	return ""
}

func normalizePreferredContactTime(value string) string {
	cleaned := normalizedSpace(strings.ToLower(strings.TrimSpace(value)))
	if cleaned == "" {
		return ""
	}

	hourPattern := regexp.MustCompile(`(?i)\b(?:a\s+las?|sobre\s+las?|aproximadamente\s+a\s+las?|alrededor\s+de\s+las?|despues\s+de\s+las?|después\s+de\s+las?)\s*(\d{1,2})(?:[:.](\d{2}))?\s*(am|pm)?\b`)
	if match := hourPattern.FindStringSubmatch(cleaned); len(match) > 1 {
		hour, err := strconv.Atoi(match[1])
		if err == nil {
			minutes := "00"
			if len(match) > 2 && match[2] != "" {
				minutes = match[2]
			}
			suffix := ""
			if len(match) > 3 {
				suffix = strings.ToLower(strings.TrimSpace(match[3]))
			}
			if suffix == "pm" && hour < 12 {
				hour += 12
			}
			if suffix == "am" && hour == 12 {
				hour = 0
			}
			prefix := "a las"
			if strings.Contains(cleaned, "despues") || strings.Contains(cleaned, "después") || strings.Contains(cleaned, "sobre") || strings.Contains(cleaned, "alrededor") {
				prefix = "despues de las"
			}
			return fmt.Sprintf("%s %02d:%s", prefix, hour, minutes)
		}
	}

	if containsAny(cleaned, []string{"tarde", "noche", "manana", "mañana", "mediodia", "medio dia"}) {
		return cleaned
	}

	return cleaned
}

func titleCase(value string) string {
	words := strings.Fields(value)
	for i, word := range words {
		if len(word) == 0 {
			continue
		}
		words[i] = strings.ToUpper(string(word[0])) + strings.ToLower(word[1:])
	}
	return strings.Join(words, " ")
}
