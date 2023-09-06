import {GlobalState} from 'mattermost-redux/types/store';
import {useSelector} from 'react-redux';

import {id as pluginId} from '@/manifest';
import {GlobalModalState} from '@/types';

//@ts-ignore GlobalState is not complete
const pluginState = (state: GlobalState) => state['plugins-' + pluginId] || {};

export default function usePluginState() {
    const globalModalState = useSelector<GlobalState, GlobalModalState>(
        (state) => pluginState(state).globalModal,
    );

    return {...globalModalState};
}
