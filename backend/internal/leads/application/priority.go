package application

import (
	"time"
)

// DerivePriorityFromTravelDate maps the tentative travel date to a commercial priority.
func DerivePriorityFromTravelDate(travelDate string, now time.Time) string {
	parsed, ok := ParseTravelDate(travelDate, now)
	if !ok {
		return "normal"
	}

	if parsed.Before(now.Add(45 * 24 * time.Hour)) {
		return "urgente"
	}

	return "normal"
}
