package smtp

import (
	"bytes"
	"context"
	"crypto/rand"
	"crypto/tls"
	"encoding/base64"
	"encoding/hex"
	"fmt"
	"mime"
	"net"
	"net/smtp"
	"strings"
	"time"

	"backend/internal/leads/application"
)

type Config struct {
	Host         string
	Port         int
	Secure       bool
	Username     string
	Password     string
	FromEmail    string
	ToEmail      string
	ArchiveEmail string
}

type Mailer struct {
	cfg Config
}

func NewMailer(cfg Config) *Mailer {
	return &Mailer{cfg: cfg}
}

func (m *Mailer) SendLeadEmail(_ context.Context, message application.EmailMessage) (string, error) {
	recipients := parseRecipients(m.cfg.ToEmail, m.cfg.ArchiveEmail)
	if len(recipients) == 0 {
		return "", fmt.Errorf("no email recipients configured")
	}
	return m.sendMessage(message, recipients)
}

func (m *Mailer) SendConfirmationEmail(_ context.Context, message application.EmailMessage) (string, error) {
	recipients := parseRecipients(message.To)
	if len(recipients) == 0 {
		return "", fmt.Errorf("no confirmation recipient configured")
	}
	return m.sendMessage(message, recipients)
}

func (m *Mailer) sendMessage(message application.EmailMessage, recipients []string) (string, error) {
	messageID := buildMessageID(m.cfg.FromEmail)
	rawMessage, err := buildRawMessage(m.cfg, message, messageID, recipients)
	if err != nil {
		return "", err
	}

	client, err := dialSMTPClient(m.cfg)
	if err != nil {
		return "", err
	}
	defer client.Close()

	auth := smtp.PlainAuth("", m.cfg.Username, m.cfg.Password, m.cfg.Host)
	if ok, _ := client.Extension("AUTH"); ok {
		if err := client.Auth(auth); err != nil {
			return "", err
		}
	}

	if err := client.Mail(m.cfg.FromEmail); err != nil {
		return "", err
	}
	for _, recipient := range recipients {
		if err := client.Rcpt(recipient); err != nil {
			return "", err
		}
	}

	writer, err := client.Data()
	if err != nil {
		return "", err
	}
	if _, err := writer.Write(rawMessage); err != nil {
		_ = writer.Close()
		return "", err
	}
	if err := writer.Close(); err != nil {
		return "", err
	}
	if err := client.Quit(); err != nil {
		return "", err
	}

	return messageID, nil
}

func dialSMTPClient(cfg Config) (*smtp.Client, error) {
	address := fmt.Sprintf("%s:%d", cfg.Host, cfg.Port)

	if cfg.Secure {
		conn, err := tls.Dial("tcp", address, &tls.Config{
			ServerName:         cfg.Host,
			MinVersion:         tls.VersionTLS12,
			InsecureSkipVerify: false,
		})
		if err != nil {
			return nil, err
		}
		return smtp.NewClient(conn, cfg.Host)
	}

	conn, err := net.DialTimeout("tcp", address, 10*time.Second)
	if err != nil {
		return nil, err
	}

	client, err := smtp.NewClient(conn, cfg.Host)
	if err != nil {
		return nil, err
	}

	if ok, _ := client.Extension("STARTTLS"); ok {
		if err := client.StartTLS(&tls.Config{
			ServerName: cfg.Host,
			MinVersion: tls.VersionTLS12,
		}); err != nil {
			return nil, err
		}
	}

	return client, nil
}

func buildRawMessage(cfg Config, message application.EmailMessage, messageID string, recipients []string) ([]byte, error) {
	boundary := "vp-" + randomHex(12)
	toHeader := strings.Join(recipients, ", ")

	var body bytes.Buffer
	writeHeader(&body, "From", fmt.Sprintf(`"Viajes Premium" <%s>`, cfg.FromEmail))
	writeHeader(&body, "To", toHeader)
	if strings.TrimSpace(message.ReplyTo) != "" {
		writeHeader(&body, "Reply-To", message.ReplyTo)
	}
	writeHeader(&body, "Subject", mime.QEncoding.Encode("utf-8", message.Subject))
	writeHeader(&body, "MIME-Version", "1.0")
	writeHeader(&body, "Message-ID", fmt.Sprintf("<%s>", messageID))
	writeHeader(&body, "Date", time.Now().Format(time.RFC1123Z))
	writeHeader(&body, "Content-Type", fmt.Sprintf(`multipart/alternative; boundary="%s"`, boundary))
	body.WriteString("\r\n")

	writePart(&body, boundary, "text/plain", message.TextBody)
	writePart(&body, boundary, "text/html", message.HTMLBody)
	body.WriteString(fmt.Sprintf("--%s--\r\n", boundary))

	return body.Bytes(), nil
}

func writePart(buffer *bytes.Buffer, boundary, contentType, body string) {
	buffer.WriteString(fmt.Sprintf("--%s\r\n", boundary))
	writeHeader(buffer, "Content-Type", fmt.Sprintf(`%s; charset="UTF-8"`, contentType))
	writeHeader(buffer, "Content-Transfer-Encoding", "base64")
	buffer.WriteString("\r\n")

	encoded := base64.StdEncoding.EncodeToString([]byte(body))
	for len(encoded) > 76 {
		buffer.WriteString(encoded[:76] + "\r\n")
		encoded = encoded[76:]
	}
	buffer.WriteString(encoded + "\r\n")
}

func writeHeader(buffer *bytes.Buffer, key, value string) {
	buffer.WriteString(key + ": " + value + "\r\n")
}

func parseRecipients(values ...string) []string {
	seen := map[string]struct{}{}
	recipients := make([]string, 0)
	for _, value := range values {
		for _, part := range strings.FieldsFunc(value, func(r rune) bool {
			return r == ',' || r == ';'
		}) {
			email := strings.TrimSpace(part)
			if email == "" {
				continue
			}
			if _, ok := seen[email]; ok {
				continue
			}
			seen[email] = struct{}{}
			recipients = append(recipients, email)
		}
	}
	return recipients
}

func buildMessageID(fromEmail string) string {
	domain := "viajespremium.local"
	if parts := strings.Split(strings.TrimSpace(fromEmail), "@"); len(parts) == 2 && parts[1] != "" {
		domain = parts[1]
	}
	return fmt.Sprintf("%s@%s", randomHex(16), domain)
}

func randomHex(size int) string {
	buf := make([]byte, size)
	if _, err := rand.Read(buf); err != nil {
		return fmt.Sprintf("%d", time.Now().UnixNano())
	}
	return hex.EncodeToString(buf)
}
