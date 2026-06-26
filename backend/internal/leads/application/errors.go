package application

import "errors"

var (
	ErrInvalidRequest    = errors.New("invalid request")
	ErrMissingRequired   = errors.New("faltan campos obligatorios (name, phone)")
	ErrSMTPNotConfigured = errors.New("SMTP no configurado. Faltan SMTP_USER o SMTP_PASS.")
)
