import {
    PayloadAction,
    createAsyncThunk,
    createSelector,
    createSlice,
} from '@reduxjs/toolkit';

import {id as pluginId} from '@/manifest';
import {
    MyKnownError,
    ReqChannelIdType,
    ReqDeleteTaskType,
    ReqNewTaskType,
    ReqTaskIdType,
    TaskState,
    TaskType,
} from '@/types';
import Client from '@/client';
import {RootState} from '@/reducers';

const initialState: TaskState = {
    entities: [],
    loading: false,
    error: undefined,
    showPanel: false,
    reload: false,
};

export const fetchTaskByChannelId = createAsyncThunk<
    // 성공 시 리턴 타입
    TaskType[],
    // input type. 아래 콜백함수에서 userId 인자가 input에 해당
    ReqChannelIdType,
    // ThunkApi 정의({dispatch?, state?, extra?, rejectValue?})
    {rejectValue: MyKnownError}
>('task/fetchTaskByChannelId', async (channelId, {rejectWithValue}) => {
    try {
        const response = await Client.httpShowTask(channelId).then((result) => {
            return result;
        });
        return response;
    } catch (err) {
        return rejectWithValue({
            errorMessage: '알 수 없는 에러가 발생했습니다.',
        });
    }
});

export const fetchNewTask = createAsyncThunk<
    // 성공 시 리턴 타입
    string,
    // input type. 아래 콜백함수에서 userId 인자가 input에 해당
    ReqNewTaskType,
    // ThunkApi 정의({dispatch?, state?, extra?, rejectValue?})
    {rejectValue: MyKnownError}
>('task/fetchNewTask', async ({channelId, taskTitle}, {rejectWithValue}) => {
    try {
        const response = await Client.httpNewTask({
            channelId,
            taskTitle,
        }).then((result) => {
            return result;
        });
        return response;
    } catch (err) {
        return rejectWithValue({
            errorMessage: '알 수 없는 에러가 발생했습니다.',
        });
    }
});

export const fetchUpdateTask = createAsyncThunk<
    // 성공 시 리턴 타입
    string,
    // input type. 아래 콜백함수에서 userId 인자가 input에 해당
    {taskId: ReqTaskIdType} & ReqNewTaskType,
    // ThunkApi 정의({dispatch?, state?, extra?, rejectValue?})
    {rejectValue: MyKnownError}
>(
    'task/fetchUpdateTask',
    async ({channelId, taskId, taskTitle}, {rejectWithValue}) => {
        try {
            const response = await Client.httpUpdateTask({
                channelId,
                taskId,
                taskTitle,
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

export const fetchDelteTask = createAsyncThunk<
    // 성공 시 리턴 타입
    string,
    // input type. 아래 콜백함수에서 userId 인자가 input에 해당
    ReqDeleteTaskType,
    // ThunkApi 정의({dispatch?, state?, extra?, rejectValue?})
    {rejectValue: MyKnownError}
>('task/fetchDeleteTask', async ({channelId, taskId}, {rejectWithValue}) => {
    try {
        const response = await Client.httpDeleteTask({
            channelId,
            taskId,
        }).then((result) => {
            return result;
        });
        return response;
    } catch (err) {
        return rejectWithValue({
            errorMessage: '알 수 없는 에러가 발생했습니다.',
        });
    }
});

const taskSlice = createSlice({
    name: 'task',
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
            // 통신 중
            .addCase(fetchTaskByChannelId.pending, (state) => {
                state.loading = true;
            })
            // 통신 성공
            .addCase(fetchTaskByChannelId.fulfilled, (state, {payload}) => {
                state.loading = false;
                state.entities = payload;
            })
            // 통신 에러
            .addCase(fetchTaskByChannelId.rejected, (state, {payload}) => {
                state.error = payload?.errorMessage;
                state.loading = false;
            });

        builder
            // 통신 중
            .addCase(fetchNewTask.pending, (state) => {
                state.loading = true;
            })
            // 통신 성공
            .addCase(fetchNewTask.fulfilled, (state, {payload}) => {
                state.loading = false;
                state.reload = !state.reload;
                state.showPanel = false;
            })
            // 통신 에러
            .addCase(fetchNewTask.rejected, (state, {payload}) => {
                state.error = payload?.errorMessage;
                state.loading = false;
            });
        builder
            // 통신 중
            .addCase(fetchUpdateTask.pending, (state) => {
                state.loading = true;
            })
            // 통신 성공
            .addCase(fetchUpdateTask.fulfilled, (state, {payload}) => {
                state.loading = false;
                state.reload = !state.reload;
                state.showPanel = false;
            })
            // 통신 에러
            .addCase(fetchUpdateTask.rejected, (state, {payload}) => {
                state.error = payload?.errorMessage;
                state.loading = false;
            });
        builder
            // 통신 중
            .addCase(fetchDelteTask.pending, (state) => {
                state.loading = true;
            })
            // 통신 성공
            .addCase(fetchDelteTask.fulfilled, (state, {payload}) => {
                state.loading = false;
                state.reload = !state.reload;
                state.showPanel = false;
            })
            // 통신 에러
            .addCase(fetchDelteTask.rejected, (state, {payload}) => {
                state.error = payload?.errorMessage;
                state.loading = false;
            });
    },
});

export const taskSliceSelector = createSelector(
    (state: RootState) =>
        state['plugins-' + pluginId].taskSlice || initialState,
    (state: TaskState) => ({...state}),
);

// eslint-disable-next-line no-empty-pattern
export const {setShowPanel, reload, reset} = taskSlice.actions;
export default taskSlice.reducer;
