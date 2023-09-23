package main

import (
	"fmt"
	"time"

	"github.com/mattermost/mattermost/server/public/model"
)

type Task struct {
	TaskID    string `json:"task_id"`
	TaskTitle string `json:"task_title"`
	UserId    string `json:"user_id"`
	CreateAt  int64  `json:"create_at"`
	UpdateAt  int64  `json:"update_at"`
	DeleteAt  int64  `json:"delete_at"`
}

func newTask(taskTitle string, userId string) *Task {
	return &Task{
		TaskID:    model.NewId(),
		TaskTitle: taskTitle,
		UserId:    userId,
		CreateAt:  model.GetMillis(),
		UpdateAt:  model.GetMillis(),
		DeleteAt:  0,
	}
}

func (p *Plugin) taskListToString(tasks []*Task) string {
	if len(tasks) == 0 {
		return "#### Empty Task!"
	}

	str := "#### 채널의 작업목록\n\n"
	str += "|NUM|TASK_ID|TASK_TITLE|USER|CREATE_AT|\n"
	str += "|---|---|---|---|---|\n"

	for num, task := range tasks {
		createAt := time.Unix(task.CreateAt/1000, 0)
		mmMention := ""
		mmUser, getErr := p.API.GetUser(task.UserId)
		if getErr != nil {
			p.API.LogError("Unable to get mm user details", "Error", getErr.Error())
		} else {
			mmMention = fmt.Sprintf("@%s ", mmUser.Username)
		}

		str += fmt.Sprintf("|%d|%s|%s|%s|%s|\n", num, task.TaskID, task.TaskTitle, mmMention, createAt.Format("2006-01-02 15:04:05"))
	}

	return str
}
