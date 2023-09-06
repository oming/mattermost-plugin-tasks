package main

import (
	"fmt"
	"time"

	"github.com/mattermost/mattermost/server/public/model"
)

type Job struct {
	JobID      string `json:"job_id"`
	JobTitle   string `json:"job_title"`
	JobContent string `json:"job_content"`
	JobStatus  string `json:"job_status"`
	UserId     string `json:"user_id"`
	CreateAt   int64  `json:"create_at"`
	UpdateAt   int64  `json:"update_at"`
	DeleteAt   int64  `json:"delete_at"`
}

func newJob(jobTitle string, jobContent string, userId string) *Job {
	return &Job{
		JobID:      model.NewId(),
		JobTitle:   jobTitle,
		JobContent: jobContent,
		JobStatus:  "open",
		UserId:     userId,
		CreateAt:   model.GetMillis(),
		UpdateAt:   model.GetMillis(),
		DeleteAt:   0,
	}
}

func (p *Plugin) jobListToMarkdownStr(jobs []*Job) string {
	if len(jobs) == 0 {
		return "#### Empty Job!"
	}

	str := "#### 할일 목록\n\n"
	str += "|NUM|JOB_ID|JOB_TITLE|JOB_CONTENT|JOB_STATUS|USER|CREATE_AT|\n"
	str += "|---|---|---|---|---|---|---|\n"

	for num, job := range jobs {
		createAt := time.Unix(job.CreateAt/1000, 0)
		mmMention := ""
		mmUser, getErr := p.API.GetUser(job.UserId)
		if getErr != nil {
			p.API.LogDebug("Unable to get mm user details", "Error", getErr.Error())
		} else {
			mmMention = fmt.Sprintf("@%s ", mmUser.Username)
		}

		str += fmt.Sprintf("|%d|%s|%s|%s|%s|%s|%s|\n", num, job.JobID, job.JobTitle, job.JobContent, job.JobStatus, mmMention, createAt.Format("2006-01-02 15:04:05"))
	}

	return str
}
