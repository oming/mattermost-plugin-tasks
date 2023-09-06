import {CommandArgs} from '@mattermost/types/lib/integrations';
import {GlobalState} from 'mattermost-redux/types/store';
import {Action, Store} from 'redux';

import {logDebug} from './utils/log';

// import {GlobalState} from 'mattermost-redux/types/store';
// import {CommandArgs} from 'mattermost-redux/types/integrations';

export default async function slashCommandsHandler(
    store: Store<GlobalState, Action<Record<string, unknown>>>,
    message: string,
    args: CommandArgs,
) {
    // eslint-disable-next-line no-console
    logDebug('hhhhhhhhhhhhhhhhhhhhhh');
    // eslint-disable-next-line no-console
    logDebug(store.getState());
    const fullCmd = message.trim();
    const fields = fullCmd.split(/\s+/);
    if (fields.length < 2) {
        return {message, args};
    }

    const rootCmd = fields[0];
    const subCmd = fields[1];

    return {message, args};
}
