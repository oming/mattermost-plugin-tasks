package main

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/mattermost/mattermost/server/public/model"
)

type ListType struct {
	Num        int    `json:"num"`
	JobID      string `json:"jobId"`
	JobTitle   string `json:"jobTitle"`
	JobContent string `json:"jobContent"`
	JobStatus  string `json:"jobStatus"`
	UserName   string `json:"userName"`
	CreateAt   int64  `json:"createAt"`
	UpdateAt   int64  `json:"updateAt"`
	DeleteAt   int64  `json:"deleteAt"`
}

func (p *Plugin) handleJob(c *gin.Context) {
	taskId := c.MustGet("taskId").(string)

	jobs, err := p.listJobs(taskId)
	if err != nil {
		p.API.LogError("listJobs Error", "Error", err.Error())
		c.JSON(http.StatusBadRequest, gin.H{"msg": err})
		return
	}

	output := []ListType{}

	for i, job := range jobs {

		mmMention := "-"
		mmUser, getErr := p.API.GetUser(job.UserId)
		if getErr != nil {
			p.API.LogDebug("Unable to get mm user details", "Error", getErr.Error())
		} else {
			mmMention = fmt.Sprintf("@%s", mmUser.Username)
		}

		output = append(output, ListType{
			Num:        i,
			JobID:      job.JobID,
			JobTitle:   job.JobTitle,
			JobContent: job.JobContent,
			JobStatus:  job.JobStatus,
			UserName:   mmMention,
			CreateAt:   job.CreateAt,
			UpdateAt:   job.UpdateAt,
			DeleteAt:   job.DeleteAt,
		})
	}

	c.JSON(http.StatusOK, output)
}

type ReqJobAddType struct {
	JobTitle   string `json:"jobTitle" binding:"required"`
	JobContent string `json:"jobContent" binding:"required"`
}

func (p *Plugin) handleJobCreate(c *gin.Context) {
	channel := c.MustGet("channel").(*model.Channel)
	user := c.MustGet("user").(*model.User)
	taskId := c.MustGet("taskId").(string)

	var json ReqJobAddType
	if err := c.ShouldBindJSON(&json); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	job, err := p.addJob(taskId, json.JobTitle, json.JobContent, user.Id)
	if err != nil {
		p.API.LogError("addCmmand Execute", "err", err.Error())
		c.JSON(http.StatusBadRequest, gin.H{"msg": err})
		return
	}

	msg := fmt.Sprintf("@%s, added a new job. taskId: %s, jobId: %s", user.Username, taskId, job.JobID)
	_, appErr := p.API.CreatePost(&model.Post{
		UserId:    p.BotUserID,
		ChannelId: channel.Id,
		Message:   msg,
	})
	if appErr != nil {
		c.JSON(http.StatusBadRequest, gin.H{"msg": err})
		return
	}

	c.JSON(http.StatusOK, job)
}

func (p *Plugin) handleJobUpdate(c *gin.Context) {
	channel := c.MustGet("channel").(*model.Channel)
	user := c.MustGet("user").(*model.User)
	taskId := c.MustGet("taskId").(string)
	jobId := c.Param("jobId")

	var json ReqJobAddType
	if err := c.ShouldBindJSON(&json); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := p.updateJob(taskId, jobId, json.JobTitle, json.JobContent)
	if err != nil {
		p.API.LogError("addCmmand Execute", "err", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"msg": err})
	}

	msg := fmt.Sprintf("@%s, modified the job. taskId: %s, jobId: %s", user.Username, taskId, jobId)
	_, appErr := p.API.CreatePost(&model.Post{
		UserId:    p.BotUserID,
		ChannelId: channel.Id,
		Message:   msg,
	})
	if appErr != nil {
		c.JSON(http.StatusBadRequest, gin.H{"msg": err})
		return
	}

	c.JSON(http.StatusOK, gin.H{"msg": "success"})
}

func (p *Plugin) handleJobDelete(c *gin.Context) {
	channel := c.MustGet("channel").(*model.Channel)
	user := c.MustGet("user").(*model.User)
	taskId := c.MustGet("taskId").(string)
	jobId := c.Param("jobId")

	if jobId == "" {
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"msg": "jobId is required"})
		return
	}

	err := p.removeJob(taskId, jobId)
	if err != nil {
		p.API.LogError("deleteCmmand Execute", "jobId", jobId, "taskId", taskId, "Error", err.Error())
		c.JSON(http.StatusBadRequest, gin.H{"msg": err})
		return
	}

	msg := fmt.Sprintf("@%s, deleted the job. taskId: %s, jobId: %s", user.Username, taskId, jobId)
	_, appErr := p.API.CreatePost(&model.Post{
		UserId:    p.BotUserID,
		ChannelId: channel.Id,
		Message:   msg,
	})
	if appErr != nil {
		c.JSON(http.StatusBadRequest, gin.H{"msg": err})
		return
	}

	c.JSON(http.StatusOK, gin.H{"msg": "success"})
}

type ReqJobStatusType struct {
	JobStatus string `json:"jobStatus" binding:"required"`
}

func (p *Plugin) handleJobStatusUpdate(c *gin.Context) {
	channel := c.MustGet("channel").(*model.Channel)
	user := c.MustGet("user").(*model.User)
	taskId := c.MustGet("taskId").(string)
	jobId := c.Param("jobId")

	var json ReqJobStatusType
	if err := c.ShouldBindJSON(&json); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := p.statusJob(taskId, jobId, json.JobStatus)
	if err != nil {
		p.API.LogError("addCmmand Execute", "err", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"msg": err})
	}

	msg := fmt.Sprintf("@%s, changed the status of the job. taskId: %s, jobId: %s, status: %s", user.Username, taskId, jobId, json.JobStatus)
	_, appErr := p.API.CreatePost(&model.Post{
		UserId:    p.BotUserID,
		ChannelId: channel.Id,
		Message:   msg,
	})
	if appErr != nil {
		c.JSON(http.StatusBadRequest, gin.H{"msg": err})
		return
	}

	c.JSON(http.StatusOK, gin.H{"msg": "success"})
}
