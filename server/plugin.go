package main

import (
	"net/http"
	"sync"

	"github.com/gin-gonic/gin"
	"github.com/mattermost/mattermost/server/public/plugin"
)

// Plugin implements the interface expected by the Mattermost server to communicate between the server and plugin processes.
type Plugin struct {
	plugin.MattermostPlugin

	// configurationLock synchronizes access to the configuration.
	configurationLock sync.RWMutex

	// configuration is the active plugin configuration. Consult getConfiguration and
	// setConfiguration for usage.
	configuration *configuration

	// tracker         telemetry.Tracker
	BotUserID string
}

// ServeHTTP demonstrates a plugin that handles HTTP requests by greeting the world.
/**
GET		/{channelId}/tasks    			모든 목록 조회(show)
POST	/{channelId}/tasks   			tasks 생성 (new)
			{task_title: "xxxx"}
PUT		/{channelId}/tasks/{taskId}		task 수정
			{task_title: "xxxx"}
DELETE	/{channelId}/tasks/{taskId}		tasks 제거 (delete)

GET		/{channelId}/tasks/{taskId}/jobs					할일 목록 조회(list)
POST    /{channelId}/tasks/{taskId}/jobs					할일 목록 추가(add)
			{jobTitle: "XXX", jobContent: "XXX"}
PUT		/{channelId}/tasks/{taskId}/jobs/{jobId}			할일 목록 수정
			{jobTitle: "XXX", jobContent: "XXX"}
DELETE  /{channelId}/tasks/{taskId}/jobs/{jobId}			할일 제거(remove)
PUT     /{channelId}/tasks/{taskId}/jobs/{jobId}/status	상태변경(status)
			{status: "open|done"}

GET 	/config							설정 파일 확인
*/
func (p *Plugin) ServeHTTP(c *plugin.Context, w http.ResponseWriter, r *http.Request) {
	p.API.LogDebug("hsan: ServeHTTP Starting")

	// 로그 색상을 비활성화 합니다
	gin.DisableConsoleColor()
	router := gin.Default()
	// gin.DebugPrintRouteFunc = func(httpMethod, absolutePath, handlerName string, nuHandlers int) {
	// 	p.API.LogDebug(fmt.Sprintf("hsan: HTTP > %s > %s > %s > %d", httpMethod, absolutePath, handlerName, nuHandlers))
	// }

	router.Use(p.ginlogger)
	router.Use(p.MattermostAuthorizationRequired)

	taskRouter := router.Group("/:channelId")
	taskRouter.Use(p.ChannelRequired)
	taskRouter.GET("/tasks", p.handleTask)
	taskRouter.POST("/tasks", p.handleTaskCreate)
	taskRouter.PUT("tasks/:taskId", p.handleTaskUpdate)
	taskRouter.DELETE("tasks/:taskId", p.handleTaskDelete)

	jobRouter := router.Group("/:channelId/tasks/:taskId")
	jobRouter.Use(p.ChannelRequired)
	jobRouter.Use(p.TaskRequired)
	jobRouter.GET("/jobs", p.handleJob)
	jobRouter.POST("/jobs", p.handleJobCreate)
	jobRouter.PUT("/jobs/:jobId", p.handleJobUpdate)
	jobRouter.DELETE("/jobs/:jobId", p.handleJobDelete)
	jobRouter.PUT("/jobs/:jobId/status", p.handleJobStatusUpdate)

	router.GET("/config", p.handleGetConfig)

	router.ServeHTTP(w, r)

}

func (p *Plugin) ginlogger(c *gin.Context) {
	c.Next()

	for _, ginErr := range c.Errors {
		p.API.LogError(ginErr.Error())
	}
}

func (p *Plugin) MattermostAuthorizationRequired(c *gin.Context) {
	userID := c.GetHeader("Mattermost-User-Id")
	if userID == "" {
		c.AbortWithStatus(http.StatusUnauthorized)
		return
	}
	user, err := p.API.GetUser(userID)
	if err != nil {
		c.AbortWithStatus(http.StatusInternalServerError)
		return
	}
	c.Set("user", user)
}

func (p *Plugin) ChannelRequired(c *gin.Context) {

	channelId := c.Param("channelId")

	channel, err := p.API.GetChannel(channelId)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}
	c.Set("channel", channel)

}

func (p *Plugin) TaskRequired(c *gin.Context) {
	taskId := c.Param("taskId")

	if taskId == "" {
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"msg": "taskId is required"})
		return
	}

	c.Set("taskId", taskId)
}

// See https://developers.mattermost.com/extend/plugins/server/reference/
