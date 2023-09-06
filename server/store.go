package main

import (
	"encoding/json"
	"fmt"

	"github.com/pkg/errors"
)

const (
	StoreChannelKey = "channel"

	StoreTaskKey = "task"
)

func channelKey(channelID string) string {
	return fmt.Sprintf("%s_%s", StoreChannelKey, channelID)
}

func taskKey(taskID string) string {
	return fmt.Sprintf("%s_%s", StoreTaskKey, taskID)
}

func (p *Plugin) GetTaskList(channelID string) ([]*Task, error) {
	p.API.LogDebug("GetTaskList", "channelId", channelID)
	originalJSONList, err := p.API.KVGet(channelKey(channelID))
	if err != nil {
		return nil, err
	}

	if originalJSONList == nil {
		p.API.LogDebug("GetTaskList originalJSONList Empty")
		return []*Task{}, nil
	}

	var list []*Task
	jsonErr := json.Unmarshal(originalJSONList, &list)
	if jsonErr != nil {
		return nil, jsonErr
	}

	p.API.LogDebug("GetTaskList", "list", list)
	return list, nil
}

func (p *Plugin) newTask(channelId, taskTitle, userId string) (*Task, error) {
	p.API.LogDebug("newTask", "channelId", channelId, "taskTitle", taskTitle, "userId", userId)
	task := newTask(taskTitle, userId)

	taskList, _ := p.GetTaskList(channelId)
	p.API.LogDebug("newTask taskList", "taskList", taskList)

	taskList = append(taskList, task)
	p.API.LogDebug("newTask taskList append", "taskList", taskList)

	jsonTaskList, jsonErr := json.Marshal(taskList)
	if jsonErr != nil {
		return nil, jsonErr
	}

	appErr := p.API.KVSet(channelKey(channelId), jsonTaskList)
	if appErr != nil {
		return nil, errors.New(appErr.Error())
	}

	jobList := []*Job{}
	jsonJobList, jsonErr2 := json.Marshal(jobList)
	if jsonErr2 != nil {
		return nil, jsonErr2
	}

	p.API.KVSet(taskKey(task.TaskID), jsonJobList)

	return task, nil
}

func (p *Plugin) deleteTask(channelId, taskId string) error {
	p.API.LogDebug("deleteTask", "taskId", taskId)
	appErr := p.API.KVDelete(taskKey(taskId))
	if appErr != nil {
		return errors.New(appErr.Error())
	}

	taskList, _ := p.GetTaskList(channelId)
	p.API.LogDebug("deleteTask taskList", "taskList", taskList)

	found := false
	for i, ir := range taskList {
		if ir.TaskID == taskId {
			taskList = append(taskList[:i], taskList[i+1:]...)
			found = true
		}
	}

	if !found {
		return errors.New("cannot find issue")
	}

	jsonTaskList, jsonErr := json.Marshal(taskList)
	if jsonErr != nil {
		return jsonErr
	}

	appErr2 := p.API.KVSet(channelKey(channelId), jsonTaskList)
	if appErr2 != nil {
		return errors.New(appErr2.Error())
	}

	return nil
}

func (p *Plugin) listJobs(taskId string) ([]*Job, error) {
	p.API.LogDebug("listJobs", "taskId", taskId)
	originalJSONList, err := p.API.KVGet(taskKey(taskId))
	if err != nil {
		return nil, err
	}

	if originalJSONList == nil {
		p.API.LogDebug("listJobs originalJSONList Empty")
		return []*Job{}, nil
	}

	var list []*Job
	jsonErr := json.Unmarshal(originalJSONList, &list)
	if jsonErr != nil {
		return nil, jsonErr
	}

	p.API.LogDebug("listJobs", "list", list)
	return list, nil
}

func (p *Plugin) addJob(taskId, jobTitle, jobContent, userId string) (*Job, error) {
	p.API.LogDebug("addJob", "taskId", taskId, "jobTitle", jobTitle, "jobContent", jobContent, "userId", userId)
	job := newJob(jobTitle, jobContent, userId)

	jobList, _ := p.listJobs(taskId)
	p.API.LogDebug("addJob", "jobList", jobList)

	jobList = append(jobList, job)
	p.API.LogDebug("addJob jobList append", "jobList", jobList)

	jsonJobList, jsonErr := json.Marshal(jobList)
	if jsonErr != nil {
		return nil, jsonErr
	}

	appErr := p.API.KVSet(taskKey(taskId), jsonJobList)
	if appErr != nil {
		return nil, errors.New(appErr.Error())
	}

	return job, nil
}

func (p *Plugin) removeJob(taskId, jobId string) error {
	p.API.LogDebug("removeJob", "taskId", taskId, "jobId", jobId)

	jobList, _ := p.listJobs(taskId)
	p.API.LogDebug("removeJob", "jobList", jobList)

	found := false
	for i, ir := range jobList {
		if ir.JobID == jobId {
			jobList = append(jobList[:i], jobList[i+1:]...)
			found = true
		}
	}

	if !found {
		return errors.New("cannot find jobId")
	}

	jsonJobList, jsonErr := json.Marshal(jobList)
	if jsonErr != nil {
		return errors.New(jsonErr.Error())
	}

	appErr := p.API.KVSet(taskKey(taskId), jsonJobList)
	if appErr != nil {
		return errors.New(appErr.Error())
	}

	return nil
}
