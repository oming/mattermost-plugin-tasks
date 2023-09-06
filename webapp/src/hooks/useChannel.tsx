import {GlobalState} from 'mattermost-redux/types/store';
import {useSelector} from 'react-redux';

import {getCurrentChannel} from 'mattermost-redux/selectors/entities/channels';

import {Channel} from 'mattermost-redux/types/channels';

export default function useChannel() {
    const channel = useSelector<GlobalState, Channel>((state) =>
        getCurrentChannel(state),
    );

    return {channel};
}
