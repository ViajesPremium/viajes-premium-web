package domain

import "time"

type Stage string

const (
	StageNew      Stage = "new"
	StageDiscover Stage = "discover"
	StageQualify  Stage = "qualify"
	StageConvert  Stage = "convert"
	StageHandoff  Stage = "handoff"
	StageClosed   Stage = "closed"
)

type Role string

const (
	RoleUser      Role = "user"
	RoleAssistant Role = "assistant"
	RoleSystem    Role = "system"
)

type BotKnowledge struct {
	Slug                   string      `json:"slug"`
	BrandName              string      `json:"brand_name"`
	DisplayName            string      `json:"display_name"`
	Description            string      `json:"description"`
	MasterPrompt           string      `json:"master_prompt"`
	BehaviorPrompt         string      `json:"-"`
	Tone                   string      `json:"tone"`
	Overview               string      `json:"overview"`
	Itineraries            []Itinerary `json:"itineraries"`
	FAQs                   []FAQ       `json:"faqs"`
	QualificationQuestions []string    `json:"qualification_questions"`
	ClosingPrompts         []string    `json:"closing_prompts"`
	Handoff                HandoffRule `json:"handoff"`
	LeadCapture            []string    `json:"lead_capture"`
	DestinationKeywords    []string    `json:"destination_keywords"`
	Keywords               []string    `json:"keywords"`
	PagePrincipalHint      string      `json:"page_principal_hint"`
}

type Itinerary struct {
	Name       string   `json:"name"`
	Duration   string   `json:"duration"`
	Summary    string   `json:"summary"`
	IdealFor   string   `json:"ideal_for"`
	Highlights []string `json:"highlights"`
	Price      string   `json:"price,omitempty"`
}

type FAQ struct {
	Question string `json:"question"`
	Answer   string `json:"answer"`
}

type HandoffRule struct {
	ThresholdScore int      `json:"threshold_score"`
	Triggers       []string `json:"triggers"`
	Reason         string   `json:"reason"`
	ClosingMessage string   `json:"closing_message"`
}

type Attribution struct {
	UTMSource   string `json:"utm_source,omitempty"`
	UTMMedium   string `json:"utm_medium,omitempty"`
	UTMCampaign string `json:"utm_campaign,omitempty"`
	UTMContent  string `json:"utm_content,omitempty"`
	UTMTerm     string `json:"utm_term,omitempty"`
	FBCLID      string `json:"fbclid,omitempty"`
	Referrer    string `json:"referrer,omitempty"`
	LandingSlug string `json:"landing_slug,omitempty"`
	Destination string `json:"destination,omitempty"`
	PagePath    string `json:"page_path,omitempty"`
}

type Conversation struct {
	ID            string
	BotSlug       string
	SessionID     string
	LandingURL    string
	LandingSlug   string
	Stage         Stage
	Score         int
	LeadID        string
	Summary       string
	Metadata      map[string]any
	LastMessageAt time.Time
	CreatedAt     time.Time
	UpdatedAt     time.Time
}

type Message struct {
	ID             string
	ConversationID string
	Role           Role
	Content        string
	Source         string
	Metadata       map[string]any
	CreatedAt      time.Time
}

type Lead struct {
	ID                   string
	ConversationID       string
	BotSlug              string
	LandingSlug          string
	Attribution          Attribution
	Name                 string
	Email                string
	Phone                string
	Interest             string
	Travelers            string
	PreferredContactTime string
	TravelDate           string
	Priority             string
	SpecialOccasion      string
	Score                int
	Stage                Stage
	HandoffRequired      bool
	HandoffReason        string
	BotEmailDueAt        time.Time
	BotEmailSentAt       time.Time
	BotEmailMessageID    string
	CreatedAt            time.Time
	UpdatedAt            time.Time
}

type LeadEvent struct {
	ID        string
	LeadID    string
	EventType string
	Details   map[string]any
	CreatedAt time.Time
}

type Response struct {
	Text           string
	Source         string
	Stage          Stage
	Score          int
	Handoff        bool
	HandoffReason  string
	ConversationID string
	LeadID         string
	BotSlug        string
}

func (b BotKnowledge) ItineraryKeywords() []string {
	keywords := make([]string, 0, len(b.Keywords)+len(b.DestinationKeywords)+len(b.Itineraries)*3)
	keywords = append(keywords, b.Keywords...)
	keywords = append(keywords, b.DestinationKeywords...)
	for _, itinerary := range b.Itineraries {
		keywords = append(keywords, itinerary.Name)
		keywords = append(keywords, itinerary.IdealFor)
		for _, highlight := range itinerary.Highlights {
			keywords = append(keywords, highlight)
		}
	}
	return keywords
}
