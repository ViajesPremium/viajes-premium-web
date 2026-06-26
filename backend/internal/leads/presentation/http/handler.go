package http

import (
	"errors"
	"net/http"

	"backend/internal/leads/application"
	"backend/internal/leads/application/dto"
	httpdto "backend/internal/leads/presentation/http/dto"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	service *application.SubmitLeadService
}

func NewHandler(service *application.SubmitLeadService) *Handler {
	return &Handler{service: service}
}

func (h *Handler) Submit(ctx *gin.Context) {
	var request httpdto.SubmitLeadRequest
	if err := ctx.ShouldBindJSON(&request); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"ok":    false,
			"error": "JSON invalido.",
		})
		return
	}

	result, err := h.service.Execute(ctx.Request.Context(), dto.SubmitLeadCommand{
		Name:           request.Name,
		Phone:          request.Phone,
		Email:          request.Email,
		CRMTag:         request.CRMTag,
		FormID:         request.FormID,
		PagePath:       request.PagePath,
		Honeypot:       request.Honeypot,
		FormLoadedAt:   request.FormLoadedAt,
		TravelDate:     request.TravelDate,
		Travelers:      request.Travelers,
		TravelWishes:   request.TravelWishes,
		ExperienceType: request.ExperienceType,
		Attribution: dto.AttributionDTO{
			UTMSource:   request.Attribution.UTMSource,
			UTMMedium:   request.Attribution.UTMMedium,
			UTMCampaign: request.Attribution.UTMCampaign,
			UTMContent:  request.Attribution.UTMContent,
			UTMTerm:     request.Attribution.UTMTerm,
			FBCLID:      request.Attribution.FBCLID,
			Referrer:    request.Attribution.Referrer,
			LandingSlug: request.Attribution.LandingSlug,
			Destination: request.Attribution.Destination,
			PagePath:    request.Attribution.PagePath,
		},
	})
	if err != nil {
		switch {
		case errors.Is(err, application.ErrInvalidRequest):
			ctx.JSON(http.StatusBadRequest, httpdto.SubmitLeadResponse{OK: false, Error: "Invalid request."})
		case errors.Is(err, application.ErrMissingRequired):
			ctx.JSON(http.StatusBadRequest, httpdto.SubmitLeadResponse{
				OK:        false,
				Error:     application.ErrMissingRequired.Error(),
				RequestID: result.RequestID,
			})
		case errors.Is(err, application.ErrSMTPNotConfigured):
			ctx.JSON(http.StatusInternalServerError, httpdto.SubmitLeadResponse{
				OK:        false,
				Error:     application.ErrSMTPNotConfigured.Error(),
				RequestID: result.RequestID,
			})
		default:
			ctx.JSON(http.StatusInternalServerError, httpdto.SubmitLeadResponse{
				OK:        false,
				Error:     "No se pudo enviar el correo de contacto.",
				RequestID: result.RequestID,
			})
		}
		return
	}

	ctx.JSON(http.StatusOK, httpdto.SubmitLeadResponse{
		OK:        true,
		MessageID: result.MessageID,
		RequestID: result.RequestID,
	})
}
