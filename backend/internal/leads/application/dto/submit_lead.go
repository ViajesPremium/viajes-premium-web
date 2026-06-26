package dto

type SubmitLeadCommand struct {
	Name           string
	Phone          string
	Email          string
	CRMTag         string
	FormID         string
	PagePath       string
	Honeypot       string
	FormLoadedAt   int64
	TravelDate     string
	Travelers      string
	TravelWishes   string
	ExperienceType string
	Attribution    AttributionDTO
}

type AttributionDTO struct {
	UTMSource   string
	UTMMedium   string
	UTMCampaign string
	UTMContent  string
	UTMTerm     string
	FBCLID      string
	Referrer    string
	LandingSlug string
	Destination string
	PagePath    string
}

type SubmitLeadResult struct {
	RequestID string
	MessageID string
}
