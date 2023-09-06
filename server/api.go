package main

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

/*
GET    /tasks?channelId={XXX}    	모든 목록 조회(show)
POST   /tasks   	 				tasks 생성 (new)

	{channelId: "XXX", task_title: "xxxx"}

DELETE /tasks    					tasks 제거 (delete)

	{channelId: "XXX", task_id: "xxx"}
*/
func (p *Plugin) httpTasks(w http.ResponseWriter, r *http.Request) {
	p.API.LogDebug("httpTasks")
	switch r.Method {
	case http.MethodGet:
		p.taskShow(w, r)
	case http.MethodPost:
		p.taskNew(w, r)
	case http.MethodDelete:
		// p.taskDelete(w, r)
	default:
		http.Error(w, "Request: "+r.Method+" is not allowed.", http.StatusMethodNotAllowed)
	}
}

type ShowType struct {
	Num       int    `json:"num"`
	TaskId    string `json:"taskId"`
	TaskTitle string `json:"taskTitle"`
	UserName  string `json:"userName"`
	CreateAt  int64  `json:"createAt"`
	UpdateAt  int64  `json:"updateAt"`
	DeleteAt  int64  `json:"deleteAt"`
}

func (p *Plugin) taskShow(w http.ResponseWriter, r *http.Request) {
	p.API.LogDebug("task show")

	channelID, ok := r.URL.Query()["channelId"]

	if !ok || len(channelID[0]) < 1 {
		http.Error(w, "Missing channelId parameter", http.StatusBadRequest)
		return
	}
	p.API.LogDebug("Channel ID " + channelID[0])

	taskList, err := p.GetTaskList(channelID[0])
	if err != nil {
		http.Error(w, "invalid channelId parameter", http.StatusBadRequest)
		return
	}

	output := []ShowType{}

	for i, task := range taskList {

		mmMention := "-"
		mmUser, getErr := p.API.GetUser(task.UserId)
		if getErr != nil {
			p.API.LogDebug("Unable to get mm user details", "Error", getErr.Error())
		} else {
			mmMention = fmt.Sprintf("@%s", mmUser.Username)
		}

		p.API.LogDebug("task value", "task", task)
		p.API.LogDebug("output value", "output", output)

		output = append(output, ShowType{
			Num:       i,
			TaskId:    task.TaskID,
			TaskTitle: task.TaskTitle,
			UserName:  mmMention,
			CreateAt:  task.CreateAt,
			UpdateAt:  task.UpdateAt,
			DeleteAt:  task.DeleteAt,
		})
	}

	p.API.LogDebug("finish output value", "output", output)

	p.writeJSON(w, output)
}

type ReqTaskNewType struct {
	ChannelId string `json:"channel_id"`
	TaskTitle string `json:"task_title"`
}

// {channelId: "XXX", task_title: "xxxx"}
func (p *Plugin) taskNew(w http.ResponseWriter, r *http.Request) {
	p.API.LogDebug("task new")

	userID := r.Header.Get("Mattermost-User-Id")

	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	var req = ReqTaskNewType{}
	if err = json.Unmarshal(body, &req); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	p.API.LogDebug("Request Value", "req", req)

	task, err := p.newTask(req.ChannelId, req.TaskTitle, userID)
	if err != nil {
		p.API.LogError("newCmmand Execute", "err", err.Error())

	}

	p.writeJSON(w, task)
}

/*
GET     /jobs?taskId={XXX}		할일 목록 조회(list)
POST    /jobs					할일 목록 추가(add)

	{taskId: "xxx", jobTitle: "XXX", jobContent: "XXX"}

DELETE  /jobs       			할일 제거(remove)

	{taskId: "xxx", "jobId: "xxx"}

PUT     /jobs       			상태변경(status)

	{taskId: "xxx", "jobId: "xxx", status: "open|done"}
*/
func (p *Plugin) httpJobs(w http.ResponseWriter, r *http.Request) {
	p.API.LogDebug("httpJobs")
	switch r.Method {
	case http.MethodGet:
		p.jobList(w, r)
	case http.MethodPost:
		p.jobAdd(w, r)
	case http.MethodDelete:
		// p.jobRemove(w, r)
	case http.MethodPut:
		// p.jobStatus(w, r)
	default:
		http.Error(w, "Request: "+r.Method+" is not allowed.", http.StatusMethodNotAllowed)
	}
}

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

func (p *Plugin) jobList(w http.ResponseWriter, r *http.Request) {
	p.API.LogDebug("job list")

	taskID, ok := r.URL.Query()["taskId"]

	if !ok || len(taskID[0]) < 1 {
		http.Error(w, "Missing taskID parameter", http.StatusBadRequest)
		return
	}
	p.API.LogDebug("TASK ID " + taskID[0])

	jobs, err := p.listJobs(taskID[0])
	if err != nil {
		http.Error(w, "invalid taskID parameter", http.StatusBadRequest)
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

		p.API.LogDebug("job value", "job", job)
		p.API.LogDebug("output value", "output", output)

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

	p.API.LogDebug("finish output value", "output", output)

	p.writeJSON(w, output)
}

type ReqJobAddType struct {
	TaskId     string `json:"taskId"`
	JobTitle   string `json:"jobTitle"`
	JobContent string `json:"jobContent"`
}

// {channelId: "XXX", task_title: "xxxx"}
func (p *Plugin) jobAdd(w http.ResponseWriter, r *http.Request) {
	p.API.LogDebug("job add")

	userID := r.Header.Get("Mattermost-User-Id")

	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	var req = ReqJobAddType{}
	if err = json.Unmarshal(body, &req); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	p.API.LogDebug("Request Value", "req", req)

	job, err := p.addJob(req.TaskId, req.JobTitle, req.JobContent, userID)
	if err != nil {
		p.API.LogError("addCmmand Execute", "err", err.Error())
	}

	p.writeJSON(w, job)
}

/*
GET 	/config					설정 파일 확인
*/
func (p *Plugin) httpConfig(w http.ResponseWriter, r *http.Request) {
	p.API.LogDebug("httpConfig")
	switch r.Method {
	case http.MethodGet:
		// p.tasksGlobalConfig(w, r)
	default:
		http.Error(w, "Request: "+r.Method+" is not allowed.", http.StatusMethodNotAllowed)
	}
}
