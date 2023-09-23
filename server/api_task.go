package main

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/mattermost/mattermost/server/public/model"
)

type ShowType struct {
	Num       int    `json:"num"`
	TaskId    string `json:"taskId"`
	TaskTitle string `json:"taskTitle"`
	UserName  string `json:"userName"`
	CreateAt  int64  `json:"createAt"`
	UpdateAt  int64  `json:"updateAt"`
	DeleteAt  int64  `json:"deleteAt"`
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

func (p *Plugin) handleTask(c *gin.Context) {

	channel := c.MustGet("channel").(*model.Channel)

	taskList, err := p.GetTaskList(channel.Id)
	if err != nil {
		p.API.LogError("GetTaskList Error", "Error", err.Error())
		c.JSON(http.StatusBadRequest, gin.H{"msg": err})
		return
	}
	var resp = []ShowType{}

	for i, task := range taskList {

		mmMention := "-"
		mmUser, err := p.API.GetUser(task.UserId)
		if err != nil {
			p.API.LogDebug("Unable to get mm user details", "Error", err.Error())
		} else {
			mmMention = fmt.Sprintf("@%s", mmUser.Username)
		}

		resp = append(resp, ShowType{
			Num:       i,
			TaskId:    task.TaskID,
			TaskTitle: task.TaskTitle,
			UserName:  mmMention,
			CreateAt:  task.CreateAt,
			UpdateAt:  task.UpdateAt,
			DeleteAt:  task.DeleteAt,
		})
	}

	c.JSON(http.StatusOK, resp)

}

type ReqTaskNewType struct {
	TaskTitle string ` json:"taskTitle" binding:"required"`
}

func (p *Plugin) handleTaskCreate(c *gin.Context) {

	channel := c.MustGet("channel").(*model.Channel)
	userId := c.MustGet("userId").(string)

	var json ReqTaskNewType
	if err := c.ShouldBindJSON(&json); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	task, err := p.newTask(channel.Id, json.TaskTitle, userId)
	if err != nil {
		p.API.LogError("newCmmand Execute", "err", err.Error())
		c.JSON(http.StatusBadRequest, gin.H{"msg": err})
		return

	}
	c.JSON(http.StatusOK, task)
}

func (p *Plugin) handleTaskUpdate(c *gin.Context) {

	channel := c.MustGet("channel").(*model.Channel)
	userId := c.MustGet("userId").(string)
	taskId := c.Param("taskId")

	var json ReqTaskNewType
	if err := c.ShouldBindJSON(&json); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := p.updateTask(channel.Id, taskId, json.TaskTitle, userId)
	if err != nil {
		p.API.LogError("UpdateCmmand Execute", "err", err.Error())
		c.JSON(http.StatusBadRequest, gin.H{"msg": err})
		return

	}
	c.JSON(http.StatusOK, gin.H{"msg": "success"})
}

func (p *Plugin) handleTaskDelete(c *gin.Context) {

	channel := c.MustGet("channel").(*model.Channel)
	taskId := c.Param("taskId")

	err := p.deleteTask(channel.Id, taskId)
	if err != nil {
		p.API.LogError("deleteCmmand Execute", "channel", channel, "taskId", taskId, "Error", err.Error())
		c.JSON(http.StatusBadRequest, gin.H{"msg": err})
		return
	}

	c.JSON(http.StatusOK, gin.H{"msg": "success"})
}
