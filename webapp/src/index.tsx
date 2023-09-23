import {Store, Action} from 'redux';
import React from 'react';
import {GlobalState} from 'mattermost-redux/types/store';

import {getCurrentChannel} from 'mattermost-redux/selectors/entities/channels';
import {getPost} from 'mattermost-redux/selectors/entities/posts';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';

import {manifest} from '@/manifest';
import {PluginRegistry} from '@/types/mattermost-webapp';

import Client from './client';
import {logDebug, logInfo} from './utils/log';
import reducer from './reducers';
import TaskIcon from './components/icons/icons';
import {directPost, globalModalOpen} from './reducers/globalSlice';
import TaskModal from './containers/TaskModal';

// eslint-disable-next-line import/no-unresolved
import 'styles.css';
import {getServerRoute} from './utils/utils';

export default class Plugin {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
    public async initialize(
        registry: PluginRegistry,
        store: Store<GlobalState, Action<Record<string, unknown>>>,
    ) {
        logDebug('Tasks Plugins Initialize.');
        Client.setServerRoute(getServerRoute(store.getState()));

        // @see https://developers.mattermost.com/extend/plugins/webapp/reference/
        registry.registerReducer(reducer);

        registry.registerRootComponent(TaskModal);

        registry.registerPostDropdownMenuAction(
            <>
                <TaskIcon style={{fontSize: '18px', marginRight: '10px'}} />
                {'Add Tasks'}
            </>,
            (postId) => {
                const state = store.getState();
                const channel = getCurrentChannel(state);
                const post = getPost(state, postId);
                const team = getCurrentTeam(state);

                store.dispatch(directPost({team, post}) as Action);
                store.dispatch(globalModalOpen(channel) as Action);
            },
        );

        registry.registerChannelHeaderButtonAction(
            <TaskIcon />,
            (channel) => {
                if (channel) {
                    logInfo(
                        '채널이 선택되었습니다.',
                        channel,
                        store.getState(),
                    );
                    store.dispatch(globalModalOpen(channel) as Action);
                }
            },
            'Tasks',
            'Open Tasks Modal',
        );
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
