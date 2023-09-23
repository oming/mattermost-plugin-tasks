import {
    PayloadAction,
    createAsyncThunk,
    createSelector,
    createSlice,
} from '@reduxjs/toolkit';

import {Channel} from 'mattermost-redux/types/channels';

import {
    DirectPostType,
    GlobalModalState,
    MyKnownError,
    TaskType,
} from '@/types';
import {id as pluginId} from '@/manifest';
import {RootState} from '@/reducers';
import Client from '@/client';

const initialState: GlobalModalState = {
    visible: false,
    channel: {
        id: '',
        create_at: 0,
        update_at: 0,
        delete_at: 0,
        team_id: '',
        type: 'D',
        display_name: '',
        name: '',
        header: '',
        purpose: '',
        last_post_at: 0,
        total_msg_count: 0,
        extra_update_at: 0,
        creator_id: '',
        scheme_id: '',
        group_constrained: false,
    },
    step: {
        type: 'task',
    },
};
export const fetchConfig = createAsyncThunk<
    // 성공 시 리턴 타입
    any,
    {rejectValue: MyKnownError}
>('global/fetchConfig', async (_, {rejectWithValue}) => {
    try {
        const response = await Client.getConfig().then((result) => {
            return result;
        });
        return response;
    } catch (err) {
        return rejectWithValue({
            errorMessage: '알 수 없는 에러가 발생했습니다.',
        });
    }
});

const globalSlice = createSlice({
    name: 'global',
    initialState,
    reducers: {
        // open(state, action: PayloadAction<GlobalModalState>) {
        globalModalOpen(state, {payload}: PayloadAction<Channel>) {
            state.visible = true;
            state.channel = payload;
        },
        globalModalClose: () => initialState,
        directPost(state, {payload}: PayloadAction<DirectPostType>) {
            state.direct = payload;
        },
        resetDirectPost(state) {
            state.direct = undefined;
        },
        setStep(
            state,
            action: PayloadAction<{
                type: 'task' | 'job';
                task?: TaskType;
            }>,
        ) {
            state.step = action.payload;
        },
        reset(state) {
            const newState: GlobalModalState = {
                ...initialState,
                channel: state.channel,
            };
            return newState;
        },
    },
});

export const globalSliceSelector = createSelector(
    (state: RootState) =>
        state['plugins-' + pluginId].globalSlice || initialState,
    (state: GlobalModalState) => ({...state}),
);

export const {
    globalModalOpen,
    globalModalClose,
    directPost,
    resetDirectPost,
    setStep,
    reset,
} = globalSlice.actions;
export default globalSlice.reducer;
