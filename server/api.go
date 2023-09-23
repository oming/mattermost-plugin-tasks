package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func (p *Plugin) handleGetConfig(c *gin.Context) {

	config := p.API.GetConfig()

	c.JSON(http.StatusOK, config)
}
