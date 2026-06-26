package domain

import "time"

type Channel string

const (
	ChannelWhatsApp Channel = "whatsapp"
	ChannelWebForm  Channel = "web-form"
)

type Attribution struct {
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

type Lead struct {
	ID                   string
	ConversationID       string
	BotSlug              string
	LandingSlug          string
	Name                 string
	Phone                string
	Email                string
	CRMTag               string
	Subject              string
	FormID               string
	PagePath             string
	Interest             string
	TravelDate           string
	Priority             string
	Travelers            string
	TravelWishes         string
	ExperienceType       string
	PreferredContactTime string
	SpecialOccasion      string
	Score                int
	Stage                string
	HandoffRequired      bool
	HandoffReason        string
	BotEmailDueAt        time.Time
	BotEmailSentAt       time.Time
	BotEmailMessageID    string
	CreatedAt            time.Time
	UpdatedAt            time.Time
	Attribution          Attribution
}

type LeadEnvelope struct {
	RequestID     string
	Lead          Lead
	LandingLabel  string
	OriginDomain  string
	TagsDirective string
	Channel       Channel
	ChannelLabel  string
	DateStamp     string
	TimeStamp     string
}
