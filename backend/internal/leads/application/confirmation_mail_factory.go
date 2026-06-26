package application

import (
	"bytes"
	"fmt"
	"html/template"
	"strings"

	"backend/internal/leads/domain"
)

// confirmationMailTemplate is parsed once at startup; template.Must panics if
// the template string is malformed, which surfaces the error at boot time.
var confirmationMailTemplate = template.Must(
	template.New("confirmation").Parse(confirmationHTMLTmpl),
)

type confirmationTheme struct {
	Primary        string
	Secondary      string
	Background     string
	Surface        string
	SurfaceAlt     string
	Text           string
	Muted          string
	Border         string
	SoftBorder     string
	PillBackground string
	LogoURL        string
}

// confirmationMailData holds every value the template needs.
// CSS fields use template.CSS so html/template skips its CSS-context escaping
// for these trusted, internally-computed values.
// Plain string fields (user data) are auto-escaped by html/template in HTML context.
type confirmationMailData struct {
	BrandLabel     string
	RecipientName  string
	RecipientEmail string
	LogoURL        template.URL
	Background     template.CSS
	SurfaceAlt     template.CSS
	Primary        template.CSS
	Text           template.CSS
	Muted          template.CSS
	Border         template.CSS
}

const confirmationHTMLTmpl = `<!doctype html><html><body style="margin:0;padding:0;background:{{.Background}};font-family:Arial,Helvetica,sans-serif;color:{{.Text}};"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:{{.Background}};padding:40px 16px;"><tr><td align="center"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border:1px solid {{.Border}};"><tr><td style="background:{{.Primary}};padding:40px 48px;text-align:center;"><img src="{{.LogoURL}}" alt="{{.BrandLabel}}" style="max-width:180px;width:100%;height:auto;display:block;margin:0 auto 20px auto;" /><span style="font-size:10px;letter-spacing:.22em;text-transform:uppercase;font-weight:700;color:rgba(255,255,255,0.65);">Confirmacion de solicitud</span></td></tr><tr><td style="height:3px;background:{{.Primary}};font-size:0;line-height:0;">&nbsp;</td></tr><tr><td style="padding:40px 48px;"><p style="margin:0 0 18px 0;font-size:17px;line-height:1.6;color:{{.Text}};">Hola {{.RecipientName}},</p><p style="margin:0 0 32px 0;font-size:14px;line-height:1.85;color:{{.Muted}};">Recibimos tu solicitud y la dejamos en proceso de revision. Si mas adelante quieres sumar algun detalle, puedes responder directamente este correo y lo tomaremos en cuenta.</p><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 32px 0;border:1px solid {{.Border}};border-left:3px solid {{.Primary}};"><tr><td style="padding:22px 24px;background:{{.SurfaceAlt}};"><p style="margin:0 0 14px 0;font-size:10px;letter-spacing:.2em;text-transform:uppercase;font-weight:700;color:{{.Primary}};">Detalles recibidos</p><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td style="font-size:13px;color:{{.Muted}};padding:5px 0;width:72px;vertical-align:top;">Marca</td><td style="font-size:13px;color:{{.Text}};padding:5px 0;font-weight:600;">{{.BrandLabel}}</td></tr><tr><td style="font-size:13px;color:{{.Muted}};padding:5px 0;vertical-align:top;">Nombre</td><td style="font-size:13px;color:{{.Text}};padding:5px 0;">{{.RecipientName}}</td></tr><tr><td style="font-size:13px;color:{{.Muted}};padding:5px 0;vertical-align:top;">Correo</td><td style="font-size:13px;color:{{.Text}};padding:5px 0;">{{.RecipientEmail}}</td></tr></table></td></tr></table><p style="margin:0;font-size:14px;line-height:1.7;color:{{.Muted}};">Gracias por confiar en {{.BrandLabel}}.</p></td></tr><tr><td style="height:1px;background:{{.Border}};font-size:0;line-height:0;">&nbsp;</td></tr><tr><td style="padding:20px 48px;text-align:center;"><span style="font-size:11px;color:{{.Muted}};letter-spacing:.03em;">Este es un correo automatico de confirmacion.</span></td></tr></table></td></tr></table></body></html>`

func buildConfirmationEmailMessage(envelope domain.LeadEnvelope) EmailMessage {
	lead := envelope.Lead
	brandLabel := firstNonEmpty(envelope.LandingLabel, "Viajes Premium")
	theme := confirmationThemeForLanding(lead.Attribution.LandingSlug)

	subject := fmt.Sprintf("Confirmacion de solicitud - %s", brandLabel)
	textBody := strings.Join([]string{
		fmt.Sprintf("Hola %s,", firstNonEmpty(lead.Name, "gracias")),
		"",
		fmt.Sprintf("Hemos recibido tu solicitud para %s.", brandLabel),
		"Un asesor revisara tu informacion y dara seguimiento a la brevedad.",
		"",
		"Si quieres responder este correo con algun detalle adicional, con gusto lo revisaremos.",
		"",
		"Marca: " + brandLabel,
	}, "\n")

	htmlBody := buildConfirmationHTMLBody(lead.Name, lead.Email, brandLabel, theme)

	return EmailMessage{
		To:       lead.Email,
		Subject:  subject,
		TextBody: textBody,
		HTMLBody: htmlBody,
	}
}

func buildConfirmationHTMLBody(name, email, brandLabel string, theme confirmationTheme) string {
	data := confirmationMailData{
		BrandLabel:     brandLabel,
		RecipientName:  firstNonEmpty(name, "Hola"),
		RecipientEmail: firstNonEmpty(email, "No especificado"),
		LogoURL:        template.URL(theme.LogoURL),
		Background:     template.CSS(theme.Background),
		SurfaceAlt:     template.CSS(theme.SurfaceAlt),
		Primary:        template.CSS(theme.Primary),
		Text:           template.CSS(theme.Text),
		Muted:          template.CSS(theme.Muted),
		Border:         template.CSS(theme.Border),
	}

	var buf bytes.Buffer
	if err := confirmationMailTemplate.Execute(&buf, data); err != nil {
		return "<p>Tu solicitud fue recibida. Pronto nos pondremos en contacto.</p>"
	}
	return buf.String()
}

func confirmationThemeForLanding(landingSlug string) confirmationTheme {
	baseURL := "https://viajespremium.com.mx"

	switch strings.TrimSpace(strings.ToLower(landingSlug)) {
	case "japon-premium":
		return confirmationTheme{
			Primary:    "#db2f21",
			Secondary:  "#95231c",
			Background: "#f6f1eb",
			Surface:    "#ffffff",
			SurfaceAlt: "#faf7f4",
			Text:       "#1f2937",
			Muted:      "#6b7280",
			Border:     "#e5ddd4",
			SoftBorder: "#d8c1b8",
			LogoURL:    baseURL + "/logos/japon/japon-grande-logo.png",
		}
	case "corea-premium":
		return confirmationTheme{
			Primary:    "#1D624E",
			Secondary:  "#482D55",
			Background: "#f4f6f3",
			Surface:    "#ffffff",
			SurfaceAlt: "#f5f8f6",
			Text:       "#1f2937",
			Muted:      "#667085",
			Border:     "#d8e0db",
			SoftBorder: "#b9cbc2",
			LogoURL:    baseURL + "/logos/corea/corea-grande-logo.png",
		}
	case "europa-premium":
		return confirmationTheme{
			Primary:    "#511E62",
			Secondary:  "#882BAC",
			Background: "#f5f0f8",
			Surface:    "#ffffff",
			SurfaceAlt: "#f8f4fb",
			Text:       "#22202a",
			Muted:      "#6d6678",
			Border:     "#e1d6ea",
			SoftBorder: "#bfa2d2",
			LogoURL:    baseURL + "/logos/europa/europa-grande-logo.png",
		}
	case "canada-premium":
		return confirmationTheme{
			Primary:    "#9E1F1E",
			Secondary:  "#377AA8",
			Background: "#f7f3ef",
			Surface:    "#ffffff",
			SurfaceAlt: "#faf6f3",
			Text:       "#21263a",
			Muted:      "#6b7280",
			Border:     "#e7d7cf",
			SoftBorder: "#d7b1a8",
			LogoURL:    baseURL + "/logos/canada/canada-grande-logo.png",
		}
	case "chiapas-premium":
		return confirmationTheme{
			Primary:    "#E939C4",
			Secondary:  "#A32B8D",
			Background: "#f8f0f7",
			Surface:    "#ffffff",
			SurfaceAlt: "#fcf5fb",
			Text:       "#231f28",
			Muted:      "#72657b",
			Border:     "#ead3e4",
			SoftBorder: "#d8a8cf",
			LogoURL:    baseURL + "/logos/chiapas/logo-chiapas.svg",
		}
	case "barrancas-premium":
		return confirmationTheme{
			Primary:    "#963825",
			Secondary:  "#D55C26",
			Background: "#f8f2ec",
			Surface:    "#ffffff",
			SurfaceAlt: "#faf5ef",
			Text:       "#261f1b",
			Muted:      "#6d5f59",
			Border:     "#e8d8cc",
			SoftBorder: "#d5ab98",
			LogoURL:    baseURL + "/logos/barrancas/barrancas-grande-logo.png",
		}
	case "yucatan-premium":
		return confirmationTheme{
			Primary:    "#EA558A",
			Secondary:  "#A42E56",
			Background: "#f8f1f4",
			Surface:    "#ffffff",
			SurfaceAlt: "#fcf5f8",
			Text:       "#251f26",
			Muted:      "#6f6270",
			Border:     "#ebd5de",
			SoftBorder: "#dba2bb",
			LogoURL:    baseURL + "/logos/yucatan/logo-yucatan.svg",
		}
	case "peru-premium":
		return confirmationTheme{
			Primary:    "#1F5198",
			Secondary:  "#132D4F",
			Background: "#f3f6fb",
			Surface:    "#ffffff",
			SurfaceAlt: "#f5f8fc",
			Text:       "#1f2430",
			Muted:      "#62708a",
			Border:     "#dbe3ef",
			SoftBorder: "#a8bddc",
			LogoURL:    baseURL + "/logos/peru/peru-grande-logo.png",
		}
	default:
		return confirmationTheme{
			Primary:    "#111827",
			Secondary:  "#374151",
			Background: "#f5f1ea",
			Surface:    "#ffffff",
			SurfaceAlt: "#f8f6f2",
			Text:       "#1f2937",
			Muted:      "#6b7280",
			Border:     "#e5e7eb",
			SoftBorder: "#cbd5e1",
			LogoURL:    baseURL + "/principal-logo.svg",
		}
	}
}

func hexToRgba(hexColor string, alpha float64) string {
	hexColor = strings.TrimPrefix(strings.TrimSpace(hexColor), "#")
	if len(hexColor) != 6 {
		return fmt.Sprintf("rgba(15, 23, 42, %.2f)", alpha)
	}

	var r, g, b int
	if _, err := fmt.Sscanf(hexColor, "%02x%02x%02x", &r, &g, &b); err != nil {
		return fmt.Sprintf("rgba(15, 23, 42, %.2f)", alpha)
	}

	return fmt.Sprintf("rgba(%d, %d, %d, %.2f)", r, g, b, alpha)
}
