package dto

type SubmitLeadRequest struct {
	Name           string                `json:"name"`
	Phone          string                `json:"phone"`
	Email          string                `json:"email"`
	CRMTag         string                `json:"crmTag"`
	FormID         string                `json:"formId"`
	PagePath       string                `json:"pagePath"`
	Honeypot       string                `json:"honeypot"`
	FormLoadedAt   int64                 `json:"formLoadedAt"`
	TravelDate     string                `json:"travelDate"`
	Travelers      string                `json:"travelers"`
	TravelWishes   string                `json:"travelWishes"`
	ExperienceType string                `json:"experienceType"`
	Attribution    SubmitLeadAttribution `json:"attribution"`
}

type SubmitLeadAttribution struct {
	UTMSource   string `json:"utm_source"`
	UTMMedium   string `json:"utm_medium"`
	UTMCampaign string `json:"utm_campaign"`
	UTMContent  string `json:"utm_content"`
	UTMTerm     string `json:"utm_term"`
	FBCLID      string `json:"fbclid"`
	Referrer    string `json:"referrer"`
	LandingSlug string `json:"landing_slug"`
	Destination string `json:"destination"`
	PagePath    string `json:"page_path"`
}
