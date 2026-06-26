package application

import (
	"strings"

	"backend/internal/leads/application/dto"
	"backend/internal/leads/domain"
)

func mapCommandToLead(command dto.SubmitLeadCommand) domain.Lead {
	return domain.Lead{
		Name:           normalize(command.Name),
		Phone:          normalize(command.Phone),
		Email:          normalize(command.Email),
		CRMTag:         normalize(command.CRMTag),
		FormID:         firstNonEmpty(normalize(command.FormID), "unknown-form"),
		PagePath:       firstNonEmpty(normalize(command.PagePath), "unknown-path"),
		Interest:       firstNonEmpty(normalize(command.TravelWishes), normalize(command.ExperienceType)),
		TravelDate:     normalize(command.TravelDate),
		Travelers:      normalize(command.Travelers),
		TravelWishes:   normalize(command.TravelWishes),
		ExperienceType: normalize(command.ExperienceType),
		Attribution: domain.Attribution{
			UTMSource:   normalize(command.Attribution.UTMSource),
			UTMMedium:   normalize(command.Attribution.UTMMedium),
			UTMCampaign: normalize(command.Attribution.UTMCampaign),
			UTMContent:  normalize(command.Attribution.UTMContent),
			UTMTerm:     normalize(command.Attribution.UTMTerm),
			FBCLID:      normalize(command.Attribution.FBCLID),
			Referrer:    normalize(command.Attribution.Referrer),
			LandingSlug: normalize(command.Attribution.LandingSlug),
			Destination: normalize(command.Attribution.Destination),
			PagePath:    normalize(command.Attribution.PagePath),
		},
	}
}

func normalize(value string) string {
	return strings.TrimSpace(value)
}

func firstNonEmpty(values ...string) string {
	for _, value := range values {
		if strings.TrimSpace(value) != "" {
			return value
		}
	}
	return ""
}
