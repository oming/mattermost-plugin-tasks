package main

import (
	"fmt"
	"strings"
	"unicode/utf8"

	"github.com/mattermost/mattermost/server/public/model"
	"github.com/mattermost/mattermost/server/public/plugin"
	"github.com/pkg/errors"
)

const (
	rootCommandTrigger   = "tasks"
	showCommandTrigger   = "show"   // alias show
	newCommandTrigger    = "new"    // alias touch
	deleteCommandTrigger = "delete" // alias delete
	listCommandTrigger   = "list"   // alias ls
	addCommandTrigger    = "add"    // alias add
	removeCommandTrigger = "remove" // alias rm
	statusCommandTrigger = "status" // alias stat
)

var subCommands = []string{
	showCommandTrigger,
	newCommandTrigger,
	deleteCommandTrigger,
	listCommandTrigger,
	addCommandTrigger,
	removeCommandTrigger,
	statusCommandTrigger,
}

func (p *Plugin) registerCommands() error {
	if err := p.API.RegisterCommand(&model.Command{
		Trigger:          rootCommandTrigger,
		DisplayName:      "Task",
		Description:      "Task, list or add",
		AutoComplete:     true,
		AutoCompleteDesc: "Available commands: " + strings.Join(subCommands, ", "),
		AutoCompleteHint: "[command]",
		AutocompleteData: getAutocompleteData(),
	}); err != nil {
		return fmt.Errorf("failed to register %s command: %w", rootCommandTrigger, err)
	}
	return nil
}

func (p *Plugin) unregisterCommands() error {
	if err := p.API.UnregisterCommand("", rootCommandTrigger); err != nil {
		return fmt.Errorf("failed to unregister %s command: %w", rootCommandTrigger, err)
	}
	return nil
}

func getAutocompleteData() *model.AutocompleteData {
	task := model.NewAutocompleteData(rootCommandTrigger, "[command]",
		"Available commands: "+strings.Join(subCommands, ","))

	showCmdData := model.NewAutocompleteData(showCommandTrigger, "", "채널 작업 목록 출력")
	task.AddCommand(showCmdData)

	newCmdData := model.NewAutocompleteData(newCommandTrigger, "[task_title]", "채널의 새로운 작업 목록을 추가")
	newCmdData.AddTextArgument("[task_title]", "작업의 제목을 입력합니다.", "")
	task.AddCommand(newCmdData)

	deleteCmdData := model.NewAutocompleteData(deleteCommandTrigger, "[#task_id]", "채널의 작업 목록 제거")
	withParamTaskKey(deleteCmdData)
	task.AddCommand(deleteCmdData)

	listCmdData := model.NewAutocompleteData(listCommandTrigger, "[#task_id]", "작업 목록 하위 할일 목록 출력")
	withParamTaskKey(listCmdData)
	task.AddCommand(listCmdData)

	addCmdData := model.NewAutocompleteData(addCommandTrigger, "[#task_id] [job_title] [job_content]", "작업 목록에 할일 목록 추가")
	withParamTaskKey(addCmdData)
	addCmdData.AddTextArgument("[job_title]", "할일 목록의 제목 입력", "")
	addCmdData.AddTextArgument("[job_content]", "할일 목록의 내용 입력", "")
	task.AddCommand(addCmdData)

	removeCmdData := model.NewAutocompleteData(removeCommandTrigger, "[#task_id] [#job_id]", "작업 목록에 할일 목록 삭제")
	withParamTaskKey(removeCmdData)
	withParamJobKey(removeCmdData)
	task.AddCommand(removeCmdData)

	statusCmdData := model.NewAutocompleteData(statusCommandTrigger, "[#task_id] [#job_id] [open|done]", "작업 목록의 할일의 상태를 변경")
	withParamTaskKey(statusCmdData)
	withParamJobKey(statusCmdData)
	statusCmdData.AddStaticListArgument("status", true, []model.AutocompleteListItem{
		{HelpText: "open", Item: "open"},
		{HelpText: "done", Item: "done"},
	})

	task.AddCommand(statusCmdData)

	return task
}

func withParamTaskKey(cmd *model.AutocompleteData) {
	cmd.AddTextArgument("Task Key", "", "")
}

func withParamJobKey(cmd *model.AutocompleteData) {
	cmd.AddTextArgument("Job Key", "", "")
}

func parseCommandLine(command string) ([]string, error) {
	fmt.Println("debug command:", command, len(command))
	var args []string
	state := "start"
	current := ""
	quote := "\""
	escapeNext := true

	for i, w := 0, 0; i < len(command); i += w {
		runeValue, width := utf8.DecodeRuneInString(command[i:])
		if state == "quotes" {
			if string(runeValue) != quote {
				current += string(runeValue)
			} else {
				args = append(args, current)
				current = ""
				state = "start"
			}
			w = width
			continue
		}

		if escapeNext {
			current += string(runeValue)
			escapeNext = false
			w = width
			continue
		}

		if runeValue == '\\' {
			escapeNext = true
			w = width
			continue
		}

		if runeValue == '"' || runeValue == '\'' {
			state = "quotes"
			quote = string(runeValue)
			w = width
			continue
		}

		if state == "arg" {
			if runeValue == ' ' || runeValue == '\t' {
				args = append(args, current)
				current = ""
				state = "start"
			} else {
				current += string(runeValue)
			}
			w = width
			continue
		}

		if runeValue != ' ' && runeValue != '\t' {
			state = "arg"
			current += string(runeValue)
		}

		w = width
	}

	if state == "quotes" {
		return []string{}, errors.New(fmt.Sprintf("Unclosed quote in command line: %s", command))
	}

	if current != "" {
		args = append(args, current)
	}

	return args, nil
}

// ExecuteCommand executes a given command and returns a command response.
func (p *Plugin) ExecuteCommand(c *plugin.Context, args *model.CommandArgs) (*model.CommandResponse, *model.AppError) {
	// quoted := false
	// fields := strings.FieldsFunc(args.Command, func(r rune) bool {
	// 	if r == '"' {
	// 		quoted = !quoted
	// 	}
	// 	return !quoted && r == ' '
	// })
	// fields := strings.Fields(args.Command)

	fields, err := parseCommandLine(args.Command)
	if err != nil {
		return &model.CommandResponse{
			ResponseType: model.CommandResponseTypeEphemeral,
			Text:         fmt.Sprintf("Error: %s", err.Error()),
		}, nil
	}

	rootCmd := strings.TrimPrefix(fields[0], "/")
	if rootCmd != rootCommandTrigger {
		return &model.CommandResponse{
			ResponseType: model.CommandResponseTypeEphemeral,
			Text:         fmt.Sprintf("Unknown command: %s", rootCmd),
		}, nil
	}

	if len(fields) < 2 {
		return &model.CommandResponse{
			ResponseType: model.CommandResponseTypeEphemeral,
			Text:         "Invalid number of arguments provided",
		}, nil
	}

	subCmd := fields[1]
	for i, ss := range fields {
		p.API.LogDebug("ExecuteCommand Debug fields", "number", i, "field", ss)
	}

	if subCmd == showCommandTrigger {
		resp, err := p.showCommand(args, fields)
		if err != nil {
			return &model.CommandResponse{
				ResponseType: model.CommandResponseTypeEphemeral,
				Text:         fmt.Sprintf("Error: %s", err.Error()),
			}, nil
		}
		return resp, nil
	}

	if subCmd == newCommandTrigger {
		resp, err := p.newCommand(args, fields)
		if err != nil {
			return &model.CommandResponse{
				ResponseType: model.CommandResponseTypeEphemeral,
				Text:         fmt.Sprintf("Error: %s", err.Error()),
			}, nil
		}
		return resp, nil
	}

	if subCmd == deleteCommandTrigger {
		resp, err := p.deleteCommand(args, fields)
		if err != nil {
			return &model.CommandResponse{
				ResponseType: model.CommandResponseTypeEphemeral,
				Text:         fmt.Sprintf("Error: %s", err.Error()),
			}, nil
		}
		return resp, nil
	}

	if subCmd == listCommandTrigger {
		resp, err := p.listCommand(fields)
		if err != nil {
			return &model.CommandResponse{
				ResponseType: model.CommandResponseTypeEphemeral,
				Text:         fmt.Sprintf("Error: %s", err.Error()),
			}, nil
		}
		return resp, nil
	}

	if subCmd == addCommandTrigger {
		resp, err := p.addCommand(args, fields)
		if err != nil {
			return &model.CommandResponse{
				ResponseType: model.CommandResponseTypeEphemeral,
				Text:         fmt.Sprintf("Error: %s", err.Error()),
			}, nil
		}
		return resp, nil
	}

	if subCmd == removeCommandTrigger {
		resp, err := p.removeCommand(fields)
		if err != nil {
			return &model.CommandResponse{
				ResponseType: model.CommandResponseTypeEphemeral,
				Text:         fmt.Sprintf("Error: %s", err.Error()),
			}, nil
		}
		return resp, nil
	}

	if subCmd == statusCommandTrigger {
		resp, err := p.statusCommand(fields)
		if err != nil {
			return &model.CommandResponse{
				ResponseType: model.CommandResponseTypeEphemeral,
				Text:         fmt.Sprintf("Error: %s", err.Error()),
			}, nil
		}
		return resp, nil
	}

	for _, cmd := range subCommands {
		if cmd == subCmd {
			return &model.CommandResponse{}, nil
		}
	}

	return &model.CommandResponse{
		ResponseType: model.CommandResponseTypeEphemeral,
		Text:         fmt.Sprintf("Invalid subcommand: " + subCmd),
	}, nil
}

func (p *Plugin) postCommandResponse(args *model.CommandArgs, text string) {
	// post := &model.Post{
	// 	// UserId:    p.getUserID(),
	// 	ChannelId: args.ChannelId,
	// 	RootId:    args.RootId,
	// 	Message:   text,
	// }
	// p.API.SendEphemeralPost(args.UserId, post)

	_, err := p.API.CreatePost(&model.Post{
		UserId:    p.BotUserID,
		ChannelId: args.ChannelId,
		RootId:    args.RootId,
		Message:   text,
	})
	if err != nil {
		p.API.LogError("Post Command Response Error", "error", err.Error())
		return
	}
}

// tasks show
func (p *Plugin) showCommand(args *model.CommandArgs, fields []string) (*model.CommandResponse, error) {
	var msg string

	taskList, err := p.GetTaskList(args.ChannelId)
	if err != nil {
		msg = "Error...."
	}

	msg = p.taskListToString(taskList)

	return &model.CommandResponse{
		ResponseType: model.CommandResponseTypeEphemeral,
		Text:         msg,
		Username:     p.BotUserID,
	}, nil
}

// tasks new "aaaaaaaaaa cdd dc ddc d"
func (p *Plugin) newCommand(args *model.CommandArgs, fields []string) (*model.CommandResponse, error) {

	terms := strings.Join(fields[2:], " ")

	if terms == "" {
		p.postCommandResponse(args, "Please Task Title...")
		return nil, nil
	}

	var msg string

	task, taskErr := p.newTask(args.ChannelId, terms, args.UserId)
	if taskErr != nil {
		p.API.LogError("newCmmand Execute", "taskErr", taskErr.Error())
	}

	msg = "task_id: " + task.TaskID + ", task_title: " + task.TaskTitle + ", user_id: " + task.UserId

	return &model.CommandResponse{
		ResponseType: model.CommandResponseTypeEphemeral,
		Text:         msg,
	}, nil
}

// tasks delete "hkjw8ykhspb9jyzfd8nfserdte"
func (p *Plugin) deleteCommand(args *model.CommandArgs, fields []string) (*model.CommandResponse, error) {

	taskId := strings.Join(fields[2:], " ")

	if taskId == "" {
		p.postCommandResponse(args, "Please Task Title...")
		return nil, nil
	}

	var msg string

	err := p.deleteTask(args.ChannelId, taskId)
	if err != nil {
		p.API.LogError("deleteCmmand Execute", "taskId", taskId, "Error", err.Error())
	}

	msg += "#### 작업목록을 제거했습니다.\n\nTASK_ID: " + taskId

	return &model.CommandResponse{
		ResponseType: model.CommandResponseTypeEphemeral,
		Text:         msg,
	}, nil
}

// tasks list "hkjw8ykhspb9jyzfd8nfserdte"
func (p *Plugin) listCommand(fields []string) (*model.CommandResponse, error) {

	taskId := strings.Join(fields[2:], " ")

	if taskId == "" {
		return nil, fmt.Errorf("Invalid taskId arguments")
	}

	var msg string
	jobs, err := p.listJobs(taskId)
	if err != nil {
		msg += "Error...."
	}

	msg += "#### taskId: " + taskId
	msg += "\n"

	msg += p.jobListToMarkdownStr(jobs)

	return &model.CommandResponse{
		ResponseType: model.CommandResponseTypeEphemeral,
		Text:         msg,
	}, nil
}

// /tasks add [#task_id] [job_title] [job_content]
func (p *Plugin) addCommand(args *model.CommandArgs, fields []string) (*model.CommandResponse, error) {
	taskId := fields[2]
	jobTitle := fields[3]
	jobContent := strings.Join(fields[4:], " ")

	if taskId == "" {
		return nil, fmt.Errorf("Invalid taskId arguments")
	}
	if jobTitle == "" || jobContent == "" {
		return nil, fmt.Errorf("Invalid jobtitle or jobcontent arguments")
	}

	var msg string

	job, jobErr := p.addJob(taskId, jobTitle, jobContent, args.UserId)
	if jobErr != nil {
		p.API.LogError("addCmmand Execute", "jobErr", jobErr.Error())

	}

	msg = "job_id: " + job.JobID + ", job_title: " + job.JobTitle + ", job_content: " + job.JobContent + ", job_status" + job.JobStatus + ", user_id: " + job.UserId

	return &model.CommandResponse{
		ResponseType: model.CommandResponseTypeEphemeral,
		Text:         msg,
	}, nil
}

// /tasks remove [#task_id] [#job_id]
func (p *Plugin) removeCommand(fields []string) (*model.CommandResponse, error) {
	taskId := fields[2]
	jobId := fields[3]

	if taskId == "" || jobId == "" {
		return nil, fmt.Errorf("taskId or jobId arguments is empty")
	}

	var msg string

	p.removeJob(taskId, jobId)

	msg = "Remove Job. task_id: " + taskId + ", job_id: " + jobId + ". compited"

	return &model.CommandResponse{
		ResponseType: model.CommandResponseTypeEphemeral,
		Text:         msg,
	}, nil
}

// /tasks status [#task_id] [#job_id] [open|done]
func (p *Plugin) statusCommand(fields []string) (*model.CommandResponse, error) {

	taskId := fields[2]
	jobId := fields[3]
	status := fields[4]

	if taskId == "" || jobId == "" || status == "" {
		return nil, fmt.Errorf("taskId or jobId or status arguments is empty")
	}

	var msg string
	if fields[2] == "open" {
		msg = "Experimental features were turned on"
	} else if fields[2] == "done" {
		msg = "Experimental features were turned off"
	}

	err := p.statusJob(taskId, jobId, status)
	if err != nil {
		p.API.LogError("statusCmmand Execute", "err", err.Error())

	}

	return &model.CommandResponse{
		ResponseType: model.CommandResponseTypeEphemeral,
		Text:         msg,
	}, nil
}
