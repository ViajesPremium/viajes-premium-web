package application

import (
	"regexp"
	"strconv"
	"strings"
	"time"
)

var travelDateMonthPatterns = map[string]time.Month{
	"enero":      time.January,
	"febrero":    time.February,
	"marzo":      time.March,
	"abril":      time.April,
	"mayo":       time.May,
	"junio":      time.June,
	"julio":      time.July,
	"agosto":     time.August,
	"septiembre": time.September,
	"setiembre":  time.September,
	"octubre":    time.October,
	"noviembre":  time.November,
	"diciembre":  time.December,
}

var (
	travelDateISOLayouts = []string{
		"2006-01-02",
		"02/01/2006",
		"02-01-2006",
		"2006/01/02",
		"02/01/06",
		"02-01-06",
	}
	travelDateDayMonthYearPattern      = regexp.MustCompile(`(?i)\b(?:el\s+)?(\d{1,2})(?:\s+de|\s+del)?\s+(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|setiembre|octubre|noviembre|diciembre)(?:\s+de\s+(\d{4}))?\b`)
	travelDateRelativeDayMonthPattern  = regexp.MustCompile(`(?i)\b(?:el\s+)?(\d{1,2})(?:\s+de|\s+del)?\s+(?:proximo|siguiente|este)\s+mes\b`)
	travelDateRelativeMonthPattern     = regexp.MustCompile(`(?i)\b(?:inicios?|inicio|principios?|principio|mediados?|mitad|finales?)\s+del?\s+(?:proximo|siguiente|este)\s+mes\b`)
	travelDateRelativeMonthOnlyPattern = regexp.MustCompile(`(?i)\b(?:proximo|siguiente|este)\s+mes\b|\bmes\s+entrante\b`)
	travelDateMonthYearPattern         = regexp.MustCompile(`(?i)\b(?:a\s+|en\s+|para\s+|durante\s+|del\s+|de\s+)?(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|setiembre|octubre|noviembre|diciembre)(?:\s+(?:de\s+)?(\d{4}))?\b`)
)

type TravelDatePrecision int

const (
	TravelDatePrecisionUnknown TravelDatePrecision = iota
	TravelDatePrecisionMonth
	TravelDatePrecisionDay
)

// ParseTravelDate converts a travel date expression into a normalized time value.
//
// The parser prefers exact dates when the day is present and falls back to the
// first day of the month for month-only expressions so the stored value remains
// a real date instead of free text.
func ParseTravelDate(value string, now time.Time) (time.Time, bool) {
	parsed, _, ok := ParseTravelDateDetails(value, now)
	return parsed, ok
}

// ParseTravelDateDetails converts a travel date expression into a normalized
// time value and reports how specific the expression is.
func ParseTravelDateDetails(value string, now time.Time) (time.Time, TravelDatePrecision, bool) {
	cleaned := normalizeTravelDateText(value)
	if cleaned == "" {
		return time.Time{}, TravelDatePrecisionUnknown, false
	}

	loc := now.Location()
	if loc == nil {
		loc = time.UTC
	}

	for _, layout := range travelDateISOLayouts {
		if parsed, err := time.ParseInLocation(layout, cleaned, loc); err == nil {
			return normalizeToDate(parsed, loc), travelDatePrecisionFromTime(parsed), true
		}
	}

	if parsed, ok := parseDayMonthYear(cleaned, now, loc); ok {
		return parsed, TravelDatePrecisionDay, true
	}
	if parsed, ok := parseRelativeDayMonth(cleaned, now, loc); ok {
		return parsed, TravelDatePrecisionDay, true
	}
	if parsed, ok := parseRelativeMonth(cleaned, now, loc); ok {
		return parsed, TravelDatePrecisionMonth, true
	}
	if parsed, ok := parseMonthOnly(cleaned, now, loc); ok {
		return parsed, TravelDatePrecisionMonth, true
	}

	return time.Time{}, TravelDatePrecisionUnknown, false
}

// NormalizeTravelDate converts a date expression into YYYY-MM-DD when possible.
func NormalizeTravelDate(value string, now time.Time) (string, bool) {
	parsed, ok := ParseTravelDate(value, now)
	if !ok {
		return "", false
	}
	return parsed.Format("2006-01-02"), true
}

func travelDatePrecisionFromTime(value time.Time) TravelDatePrecision {
	if value.IsZero() {
		return TravelDatePrecisionUnknown
	}
	if value.Day() == 1 {
		return TravelDatePrecisionMonth
	}
	return TravelDatePrecisionDay
}

func parseDayMonthYear(cleaned string, now time.Time, loc *time.Location) (time.Time, bool) {
	match := travelDateDayMonthYearPattern.FindStringSubmatch(cleaned)
	if len(match) < 3 {
		return time.Time{}, false
	}

	day, err := strconv.Atoi(match[1])
	if err != nil || day < 1 || day > 31 {
		return time.Time{}, false
	}

	month, ok := travelDateMonthPatterns[match[2]]
	if !ok {
		return time.Time{}, false
	}

	year := now.Year()
	if len(match) > 3 && match[3] != "" {
		parsedYear, ok := parseYearOnly(match[3])
		if !ok {
			return time.Time{}, false
		}
		year = parsedYear
	} else {
		candidate := time.Date(year, month, day, 0, 0, 0, 0, loc)
		currentDate := dateOnly(now, loc)
		if candidate.Before(currentDate) {
			year++
		}
	}

	return time.Date(year, month, day, 0, 0, 0, 0, loc), true
}

func parseRelativeDayMonth(cleaned string, now time.Time, loc *time.Location) (time.Time, bool) {
	match := travelDateRelativeDayMonthPattern.FindStringSubmatch(cleaned)
	if len(match) < 2 {
		return time.Time{}, false
	}

	day, err := strconv.Atoi(match[1])
	if err != nil || day < 1 || day > 31 {
		return time.Time{}, false
	}

	nextMonth := now.AddDate(0, 1, 0)
	return time.Date(nextMonth.Year(), nextMonth.Month(), day, 0, 0, 0, 0, loc), true
}

func parseRelativeMonth(cleaned string, now time.Time, loc *time.Location) (time.Time, bool) {
	if travelDateRelativeMonthPattern.MatchString(cleaned) {
		if strings.Contains(cleaned, "este mes") {
			return time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, loc), true
		}

		nextMonth := now.AddDate(0, 1, 0)
		return time.Date(nextMonth.Year(), nextMonth.Month(), 1, 0, 0, 0, 0, loc), true
	}

	if !travelDateRelativeMonthOnlyPattern.MatchString(cleaned) {
		return time.Time{}, false
	}

	if strings.Contains(cleaned, "este mes") {
		return time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, loc), true
	}

	if strings.Contains(cleaned, "mes entrante") {
		nextMonth := now.AddDate(0, 1, 0)
		return time.Date(nextMonth.Year(), nextMonth.Month(), 1, 0, 0, 0, 0, loc), true
	}

	nextMonth := now.AddDate(0, 1, 0)
	return time.Date(nextMonth.Year(), nextMonth.Month(), 1, 0, 0, 0, 0, loc), true
}

func parseMonthOnly(cleaned string, now time.Time, loc *time.Location) (time.Time, bool) {
	match := travelDateMonthYearPattern.FindStringSubmatchIndex(cleaned)
	if len(match) < 4 {
		return time.Time{}, false
	}

	monthValue := cleaned[match[2]:match[3]]
	month, ok := travelDateMonthPatterns[monthValue]
	if !ok {
		return time.Time{}, false
	}

	year := now.Year()
	if len(match) >= 6 && match[4] >= 0 && match[5] > match[4] {
		parsedYear, ok := parseYearOnly(cleaned[match[4]:match[5]])
		if !ok {
			return time.Time{}, false
		}
		year = parsedYear
	} else {
		remainder := strings.TrimSpace(cleaned[match[3]:])
		if remainder != "" {
			fields := strings.Fields(remainder)
			if len(fields) > 0 {
				first := strings.Trim(fields[0], ".,;:!?()[]{}\"'")
				if first != "" && first[0] >= '0' && first[0] <= '9' {
					return time.Time{}, false
				}
			}
		}

		if month < now.Month() {
			year++
		}
	}

	return time.Date(year, month, 1, 0, 0, 0, 0, loc), true
}

func parseYearOnly(value string) (int, bool) {
	if len(value) != 4 {
		return 0, false
	}
	year := 0
	for _, r := range value {
		if r < '0' || r > '9' {
			return 0, false
		}
		year = year*10 + int(r-'0')
	}
	return year, true
}

func normalizeToDate(value time.Time, loc *time.Location) time.Time {
	return time.Date(value.Year(), value.Month(), value.Day(), 0, 0, 0, 0, loc)
}

func dateOnly(value time.Time, loc *time.Location) time.Time {
	return time.Date(value.Year(), value.Month(), value.Day(), 0, 0, 0, 0, loc)
}

func normalizeTravelDateText(value string) string {
	value = strings.ToLower(strings.TrimSpace(value))
	replacer := strings.NewReplacer(
		"\u00e1", "a",
		"\u00e9", "e",
		"\u00ed", "i",
		"\u00f3", "o",
		"\u00fa", "u",
		"\u00f1", "n",
		"\u00fc", "u",
	)
	return replacer.Replace(value)
}
