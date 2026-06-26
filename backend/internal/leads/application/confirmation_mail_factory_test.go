package application

import (
	"strings"
	"testing"

	"backend/internal/leads/domain"
)

func TestBuildConfirmationEmailMessage_UsesBrandThemePerLanding(t *testing.T) {
	tests := []struct {
		name         string
		landingSlug  string
		landingLabel string
		wantPrimary  string
		wantLogo     string
	}{
		{
			name:         "Japan",
			landingSlug:  "japon-premium",
			landingLabel: "Japon PREMIUM",
			wantPrimary:  "#db2f21",
			wantLogo:     "https://viajespremium.com.mx/logos/japon/japon-grande-logo.png",
		},
		{
			name:         "Europe",
			landingSlug:  "europa-premium",
			landingLabel: "Europa PREMIUM",
			wantPrimary:  "#511E62",
			wantLogo:     "https://viajespremium.com.mx/logos/europa/europa-grande-logo.png",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			envelope := domain.LeadEnvelope{
				LandingLabel: tt.landingLabel,
				Lead: domain.Lead{
					Name:  "Karim Bernal",
					Email: "karim@example.com",
					Attribution: domain.Attribution{
						LandingSlug: tt.landingSlug,
					},
				},
			}

			message := buildConfirmationEmailMessage(envelope)

			if !strings.Contains(message.Subject, tt.landingLabel) {
				t.Fatalf("expected subject to contain landing label %q, got %q", tt.landingLabel, message.Subject)
			}
			if !strings.Contains(message.HTMLBody, tt.wantPrimary) {
				t.Fatalf("expected html body to contain primary color %q", tt.wantPrimary)
			}
			if !strings.Contains(message.HTMLBody, tt.wantLogo) {
				t.Fatalf("expected html body to contain logo url %q", tt.wantLogo)
			}
			if !strings.Contains(message.HTMLBody, tt.landingLabel) {
				t.Fatalf("expected html body to contain landing label %q", tt.landingLabel)
			}
		})
	}
}

func TestConfirmationThemeForLanding_Fallback(t *testing.T) {
	theme := confirmationThemeForLanding("unknown-land")

	if theme.LogoURL != "https://viajespremium.com.mx/principal-logo.svg" {
		t.Fatalf("expected fallback logo, got %q", theme.LogoURL)
	}
	if theme.Primary == "" || theme.Secondary == "" {
		t.Fatalf("expected fallback theme colors to be populated")
	}
}
