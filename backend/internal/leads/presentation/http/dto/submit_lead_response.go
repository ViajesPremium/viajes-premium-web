package dto

type SubmitLeadResponse struct {
	OK        bool   `json:"ok"`
	MessageID string `json:"messageId,omitempty"`
	RequestID string `json:"requestId,omitempty"`
	Error     string `json:"error,omitempty"`
}
