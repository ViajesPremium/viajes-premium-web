package http

import (
	"net/http"
	"strings"

	"backend/internal/platform/config"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

type LeadHandler interface {
	Submit(*gin.Context)
}

type ChatHandler interface {
	Message(*gin.Context)
}

func NewRouter(cfg config.Config, leadHandler LeadHandler, chatHandler ChatHandler) *gin.Engine {
	if strings.EqualFold(cfg.AppEnv, "production") {
		gin.SetMode(gin.ReleaseMode)
	}

	router := gin.New()
	router.Use(gin.Logger())
	router.Use(gin.Recovery())
	router.Use(buildCORS(cfg.AllowedOrigins))

	router.GET("/healthz", func(ctx *gin.Context) {
		ctx.JSON(http.StatusOK, gin.H{"ok": true})
	})

	api := router.Group("/api")
	api.POST("/leads", leadHandler.Submit)

	apiV1 := router.Group("/api/v1")
	apiV1.POST("/chat/message", chatHandler.Message)

	return router
}

func buildCORS(origins []string) gin.HandlerFunc {
	if len(origins) == 0 {
		return cors.New(cors.Config{
			AllowAllOrigins: true,
			AllowMethods:    []string{http.MethodGet, http.MethodPost, http.MethodOptions},
			AllowHeaders:    []string{"Origin", "Content-Type", "Accept", "Authorization"},
		})
	}

	return cors.New(cors.Config{
		AllowOrigins:     origins,
		AllowMethods:     []string{http.MethodGet, http.MethodPost, http.MethodOptions},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		AllowCredentials: false,
	})
}
