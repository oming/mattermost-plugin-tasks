import {
    PayloadAction,
    createAsyncThunk,
    createSelector,
    createSlice,
} from '@reduxjs/toolkit';

import {id as pluginId} from '@/manifest';
import {
    MyKnownError,
    JobState,
    JobType,
    ReqTaskIdType,
    ReqNewJobType,
    ReqStatusJobType,
    ReqRemoveJobType,
    ReqJobIdType,
    ReqListJobType,
    ReqUpdateJobType,
} from '@/types';
import Client from '@/client';
import {RootState} from '@/reducers';

const initialState: JobState = {
    entities: [],
    loading: false,
    error: undefined,
    showPanel: false,
    reload: false,
};

export const fetchJobByTaskId = createAsyncThunk<
    JobType[],
    ReqListJobType,
    {rejectValue: MyKnownError}
>('job/fetchJobByTaskId', async ({channelId, taskId}, {rejectWithValue}) => {
    try {
        const response = await Client.httpListJob({channelId, taskId}).then(
            (result) => {
                return result;
            },
        );
        return response;
    } catch (err) {
        return rejectWithValue({
            errorMessage: '알 수 없는 에러가 발생했습니다.',
        });
    }
});
export const fetchNewJob = createAsyncThunk<
    // 성공 시 리턴 타입
    string,
    // input type. 아래 콜백함수에서 userId 인자가 input에 해당
    ReqNewJobType,
    // ThunkApi 정의({dispatch?, state?, extra?, rejectValue?})
    {rejectValue: MyKnownError}
>(
    'job/fetchNewJob',
    async ({channelId, taskId, jobTitle, jobContent}, {rejectWithValue}) => {
        try {
            const response = await Client.httpAddJob({
                channelId,
                taskId,
                jobTitle,
                jobContent,
            }).then((result) => {
                return result;
            });
            return response;
        } catch (err) {
            return rejectWithValue({
                errorMessage: '알 수 없는 에러가 발생했습니다.',
            });
        }
    },
);

export const fetchUpdateJob = createAsyncThunk<
    // 성공 시 리턴 타입
    string,
    // input type. 아래 콜백함수에서 userId 인자가 input에 해당
    ReqUpdateJobType,
    // ThunkApi 정의({dispatch?, state?, extra?, rejectValue?})
    {rejectValue: MyKnownError}
>(
    'job/fetchUpdateJob',
    async (
        {channelId, taskId, jobId, jobTitle, jobContent},
        {rejectWithValue},
    ) => {
        try {
            const response = await Client.httpUpdateJob({
                channelId,
                taskId,
                jobId,
                jobTitle,
                jobContent,
            }).then((result) => {
                return result;
            });
            return response;
        } catch (err) {
            return rejectWithValue({
                errorMessage: '알 수 없는 에러가 발생했습니다.',
            });
        }
    },
);

export const fetchRemoveJob = createAsyncThunk<
    // 성공 시 리턴 타입
    string,
    // input type. 아래 콜백함수에서 userId 인자가 input에 해당
    ReqRemoveJobType,
    // ThunkApi 정의({dispatch?, state?, extra?, rejectValue?})
    {rejectValue: MyKnownError}
>(
    'job/fetchRemoveJob',
    async ({channelId, taskId, jobId}, {rejectWithValue}) => {
        try {
            const response = await Client.httpRemoveJob({
                channelId,
                taskId,
                jobId,
            }).then((result) => {
                return result;
            });
            return response;
        } catch (err) {
            return rejectWithValue({
                errorMessage: '알 수 없는 에러가 발생했습니다.',
            });
        }
    },
);

export const fetchStatusJob = createAsyncThunk<
    // 성공 시 리턴 타입
    string,
    // input type. 아래 콜백함수에서 userId 인자가 input에 해당
    ReqStatusJobType,
    // ThunkApi 정의({dispatch?, state?, extra?, rejectValue?})
    {rejectValue: MyKnownError}
>(
    'job/fetchStatusJob',
    async ({channelId, taskId, jobId, jobStatus}, {rejectWithValue}) => {
        try {
            const response = await Client.httpStatusJob({
                channelId,
                taskId,
                jobId,
                jobStatus,
            }).then((result) => {
                return result;
            });
            return response;
        } catch (err) {
            return rejectWithValue({
                errorMessage: '알 수 없는 에러가 발생했습니다.',
            });
        }
    },
);

const jobSlice = createSlice({
    name: 'job',
    initialState,
    reducers: {
        setShowPanel(state, action: PayloadAction<boolean>) {
            state.showPanel = action.payload;
        },
        reload(state) {
            return {
                ...initialState,
                reload: !state.reload,
            };
        },
        reset: () => initialState,
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchJobByTaskId.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchJobByTaskId.fulfilled, (state, {payload}) => {
                state.loading = false;
                state.entities = payload;
            })
            .addCase(fetchJobByTaskId.rejected, (state, {payload}) => {
                state.error = payload?.errorMessage;
                state.loading = false;
            });
        builder
            .addCase(fetchNewJob.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchNewJob.fulfilled, (state, {payload}) => {
                state.loading = false;
                state.reload = !state.reload;
                state.showPanel = false;
            })
            .addCase(fetchNewJob.rejected, (state, {payload}) => {
                state.error = payload?.errorMessage;
                state.loading = false;
            });
        builder
            .addCase(fetchUpdateJob.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchUpdateJob.fulfilled, (state, {payload}) => {
                state.loading = false;
                state.reload = !state.reload;
                state.showPanel = false;
            })
            .addCase(fetchUpdateJob.rejected, (state, {payload}) => {
                state.error = payload?.errorMessage;
                state.loading = false;
            });
        builder
            .addCase(fetchRemoveJob.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchRemoveJob.fulfilled, (state, {payload}) => {
                state.loading = false;
                state.reload = !state.reload;
                state.showPanel = false;
            })
            .addCase(fetchRemoveJob.rejected, (state, {payload}) => {
                state.error = payload?.errorMessage;
                state.loading = false;
            });
        builder
            .addCase(fetchStatusJob.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchStatusJob.fulfilled, (state, {payload}) => {
                state.loading = false;
                state.reload = !state.reload;
                state.showPanel = false;
            })
            .addCase(fetchStatusJob.rejected, (state, {payload}) => {
                state.error = payload?.errorMessage;
                state.loading = false;
            });
    },
});

export const jobSliceSelector = createSelector(
    (state: RootState) => state['plugins-' + pluginId].jobSlice || initialState,
    (state: JobState) => ({...state}),
);

// eslint-disable-next-line no-empty-pattern
export const {setShowPanel, reload, reset} = jobSlice.actions;
export default jobSlice.reducer;
