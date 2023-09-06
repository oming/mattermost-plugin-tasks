package main

import (
	"io/ioutil"
	"path/filepath"

	"github.com/mattermost/mattermost/server/public/model"
	"github.com/pkg/errors"
)

func (p *Plugin) setupBotUser() error {
	botUserID, err := p.API.EnsureBotUser(&model.Bot{
		Username:    "tasks",
		DisplayName: "Tasks",
		Description: "Bot for tasks plugin.",
	})
	if err != nil {
		p.API.LogError("Error in setting up bot user", "Error", err.Error())
		return err
	}

	bundlePath, err := p.API.GetBundlePath()
	if err != nil {
		return err
	}

	profileImage, err := ioutil.ReadFile(filepath.Join(bundlePath, "assets", "icon.png"))
	if err != nil {
		return err
	}

	if appErr := p.API.SetProfileImage(botUserID, profileImage); appErr != nil {
		return errors.Wrap(appErr, "couldn't set profile image")
	}

	p.BotUserID = botUserID
	return nil
}

func (p *Plugin) OnActivate() error {
	p.API.LogDebug("Activating Plugin")

	if err := p.setupBotUser(); err != nil {
		p.API.LogError("Failed to create a bot user", "Error", err.Error())
		return err
	}

	if err := p.registerCommands(); err != nil {
		p.API.LogError(err.Error())
		return err
	}

	return nil
}

func (p *Plugin) OnDeactivate() error {
	p.API.LogDebug("Deactivating Plugin")

	if err := p.unregisterCommands(); err != nil {
		p.API.LogError(err.Error())
	}

	return nil
}
