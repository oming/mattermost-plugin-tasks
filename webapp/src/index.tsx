import {Store, Action} from 'redux';
import React from 'react';
import {GlobalState} from 'mattermost-redux/types/store';

import {manifest} from '@/manifest';
import {PluginRegistry} from '@/types/mattermost-webapp';

import {getServerRoute} from './selectors';
import Client from './client';
import {logInfo} from './utils/log';
import slashCommandsHandler from './slash_commands';
import reducer from './reducers';
import TaskIcon from './components/icons/icons';
import {globalModalOpen} from './reducers/globalModal';
import TasksModal from './containers/TaskModal';

// eslint-disable-next-line import/no-unresolved
import 'styles.css';

export default class Plugin {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
    public async initialize(
        registry: PluginRegistry,
        store: Store<GlobalState, Action<Record<string, unknown>>>,
    ) {
        logInfo('Tasks Plugins Initialize.');

        // const currChannelId = getCurrentChannelId(store.getState());

        Client.setServerRoute(getServerRoute(store.getState()));

        // @see https://developers.mattermost.com/extend/plugins/webapp/reference/
        registry.registerReducer(reducer);

        registry.registerRootComponent(TasksModal);

        // const ChannelHeaderMenuButton = () => {
        //     return <p>{'Taksk'}</p>;
        // };
        // registry.registerChannelHeaderMenuAction(
        //     ChannelHeaderMenuButton,
        //     (channelId) => {
        //         store.dispatch({
        //             type: MODAL_OPEN,
        //             data: {
        //                 channelId,
        //             },
        //         } as Action);
        //     },
        // );
        // const {toggleRHSPlugin} = registry.registerRightHandSidebarComponent(
        //     <></>,
        //     'Notepad',
        // );

        // registry.registerChannelHeaderButtonAction(
        //     <></>,
        //     () => store.dispatch(toggleRHSPlugin),
        //     'Notepad',
        //     'View Notepad',
        // );

        registry.registerChannelHeaderButtonAction(
            <TaskIcon />,
            () => {
                store.dispatch(globalModalOpen() as Action);
            },
            'Tasks',
            'Open Tasks Modal',
        );

        registry.registerSlashCommandWillBePostedHook(async (message, args) => {
            return slashCommandsHandler(store, message, args);
        });
    }
}

declare global {
    interface Window {
        registerPlugin(pluginId: string, plugin: Plugin): void;
        Components: any;
        PostUtils: Record<
            'formatText' | 'messageHtmlToComponent',
            (args: any) => string | React.Component
        >;
        basename: string;
    }
}

window.registerPlugin(manifest.id, new Plugin());
