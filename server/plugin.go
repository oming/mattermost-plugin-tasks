package main

import (
	"encoding/json"
	"net/http"
	"sync"

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
func (p *Plugin) ServeHTTP(c *plugin.Context, w http.ResponseWriter, r *http.Request) {
	p.API.LogDebug("ServeHTTP Start")
	w.Header().Set("Content-Type", "application/json")

	userID := r.Header.Get("Mattermost-User-Id")
	if userID == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	p.API.LogDebug("UserID: " + userID)

	/**
	GET    /tasks?channelId={XXX}    	모든 목록 조회(show)
	POST   /tasks   	 				tasks 생성 (new)
			{channelId: "XXX", task_title: "xxxx"}
	DELETE /tasks    					tasks 제거 (delete)
			{channelId: "XXX", task_id: "xxx"}

	GET     /jobs?taskId={XXX}		할일 목록 조회(list)
	POST    /jobs					할일 목록 추가(add)
			{taskId: "xxx", jobTitle: "XXX", jobContent: "XXX"}
	DELETE  /jobs       			할일 제거(remove)
			{taskId: "xxx", "jobId: "xxx"}
	PUT     /jobs       			상태변경(status)
			{taskId: "xxx", "jobId: "xxx", status: "open|done"}

	GET 	/config					설정 파일 확인
	*/

	switch path := r.URL.Path; path {
	case "/tasks":
		p.httpTasks(w, r)
	case "/jobs":
		p.httpJobs(w, r)
	case "/config":
		p.httpConfig(w, r)
	default:
		http.NotFound(w, r)
	}
}

func (p *Plugin) writeJSON(w http.ResponseWriter, v interface{}) {
	p.API.LogDebug("writeJSON", "value", v)
	b, err := json.Marshal(v)
	if err != nil {
		p.API.LogWarn("Failed to marshal JSON response", "error", err.Error())
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	_, err = w.Write(b)
	if err != nil {
		p.API.LogWarn("Failed to write JSON response", "error", err.Error())
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
}

// See https://developers.mattermost.com/extend/plugins/server/reference/
