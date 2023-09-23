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

	if channelID == "" {
		return nil, errors.New("ChannelID is required.")
	} else {
		_, err := p.API.GetChannel(channelID)
		if err != nil {
			return nil, err
		}
	}

	originalJSONList, err := p.API.KVGet(channelKey(channelID))
	if err != nil {
		return nil, err
	}

	if originalJSONList == nil {
		p.API.LogError("GetTaskList originalJSONList Empty")
		return []*Task{}, nil
	}

	var list []*Task
	jsonErr := json.Unmarshal(originalJSONList, &list)
	if jsonErr != nil {
		return nil, jsonErr
	}

	return list, nil
}

func (p *Plugin) newTask(channelId, taskTitle, userId string) (*Task, error) {

	if channelId == "" {
		return nil, errors.New("ChannelID is required.")
	} else {
		_, err := p.API.GetChannel(channelId)
		if err != nil {
			return nil, err
		}
	}
	if taskTitle == "" {
		return nil, errors.New("taskTitle is required.")
	}

	task := newTask(taskTitle, userId)

	taskList, _ := p.GetTaskList(channelId)

	taskList = append(taskList, task)

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

func (p *Plugin) updateTask(channelId, taskId, taskTitle, userId string) error {

	if channelId == "" {
		return errors.New("ChannelID is required.")
	} else {
		_, err := p.API.GetChannel(channelId)
		if err != nil {
			return err
		}
	}
	if taskId == "" {
		return errors.New("taskId is required.")
	}
	if taskTitle == "" {
		return errors.New("taskTitle is required.")
	}

	taskList, _ := p.GetTaskList(channelId)

	found := false
	for i, ir := range taskList {
		if ir.TaskID == taskId {
			task := taskList[i]
			task.TaskTitle = taskTitle
			found = true
		}
	}

	if !found {
		return errors.New("cannot find taskId")
	}

	jsonTaskList, jsonErr := json.Marshal(taskList)
	if jsonErr != nil {
		return jsonErr
	}

	appErr := p.API.KVSet(channelKey(channelId), jsonTaskList)
	if appErr != nil {
		return errors.New(appErr.Error())
	}

	return nil
}

func (p *Plugin) deleteTask(channelId, taskId string) error {

	if channelId == "" {
		return errors.New("ChannelID is required.")
	} else {
		_, err := p.API.GetChannel(channelId)
		if err != nil {
			return err
		}
	}

	appErr := p.API.KVDelete(taskKey(taskId))
	if appErr != nil {
		return errors.New(appErr.Error())
	}

	taskList, _ := p.GetTaskList(channelId)

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
	if taskId == "" {
		return nil, errors.New("taskId is required.")
	}

	originalJSONList, err := p.API.KVGet(taskKey(taskId))
	if err != nil {
		return nil, err
	}

	if originalJSONList == nil {
		p.API.LogError("listJobs originalJSONList Empty")
		return []*Job{}, nil
	}

	var list []*Job
	jsonErr := json.Unmarshal(originalJSONList, &list)
	if jsonErr != nil {
		return nil, jsonErr
	}

	return list, nil
}

func (p *Plugin) addJob(taskId, jobTitle, jobContent, userId string) (*Job, error) {

	if taskId == "" {
		return nil, errors.New("taskId is required.")
	}
	if jobTitle == "" || jobContent == "" {
		return nil, errors.New("taskId or jobContent is required.")
	}

	job := newJob(jobTitle, jobContent, userId)

	jobList, _ := p.listJobs(taskId)

	jobList = append(jobList, job)

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

func (p *Plugin) updateJob(taskId, jobId, jobTitle, jobContent string) error {
	if taskId == "" {
		return errors.New("taskId is required.")
	}
	if jobId == "" {
		return errors.New("jobId is required.")
	}
	if jobTitle == "" {
		return errors.New("jobTitle is required.")
	}
	if jobContent == "" {
		return errors.New("jobContent is required.")
	}

	jobList, _ := p.listJobs(taskId)

	found := false
	for i, ir := range jobList {
		if ir.JobID == jobId {
			job := jobList[i]
			job.JobTitle = jobTitle
			job.JobContent = jobContent
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

func (p *Plugin) removeJob(taskId, jobId string) error {
	if taskId == "" {
		return errors.New("taskId is required.")
	}
	if jobId == "" {
		return errors.New("jobId is required.")
	}

	jobList, _ := p.listJobs(taskId)

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

func (p *Plugin) statusJob(taskId, jobId, status string) error {
	if taskId == "" {
		return errors.New("taskId is required.")
	}
	if jobId == "" {
		return errors.New("jobId is required.")
	}
	if status == "" {
		return errors.New("jobId is required.")
	}
	if !(status == "open" || status == "done") {
		return errors.New("status only [open] or [done].")
	}

	jobList, _ := p.listJobs(taskId)

	found := false
	for i, ir := range jobList {
		if ir.JobID == jobId {
			job := jobList[i]
			job.JobStatus = status
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
