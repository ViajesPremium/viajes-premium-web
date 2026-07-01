package http

import (
	"net/http"

	app "backend/internal/chat/application"
	httpdto "backend/internal/chat/presentation/http/dto"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	service *app.Service
}

func NewHandler(service *app.Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) Message(ctx *gin.Context) {
	var request httpdto.MessageRequest
	if err := ctx.ShouldBindJSON(&request); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"ok":    false,
			"error": "JSON invalido.",
		})
		return
	}

	response, err := h.service.HandleMessage(ctx.Request.Context(), app.MessageRequest{
		BotSlug:     request.BotSlug,
		SessionID:   request.SessionID,
		LandingURL:  request.LandingURL,
		Message:     request.Message,
		Name:        request.Name,
		Email:       request.Email,
		Phone:       request.Phone,
		Attribution: request.Attribution,
	})
	if err != nil {
		if err == app.ErrLLMRequired {
			ctx.JSON(http.StatusServiceUnavailable, gin.H{
				"ok":    false,
				"error": "El agente de IA no esta configurado o no esta disponible.",
			})
			return
		}

		ctx.JSON(http.StatusInternalServerError, gin.H{
			"ok":    false,
			"error": err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, response)
}
