import {PayloadAction, createAsyncThunk, createSlice} from '@reduxjs/toolkit';

import {TasksState, TasksType} from '@/types';
import Client from '@/client';
import {logDebug} from '@/utils/log';

const initialState: TasksState = {
    entities: [],
    loading: false,
    currentRequestId: undefined,
    error: undefined,
};

const fetchTasksId = createAsyncThunk(
    'tasks/fetch',
    async (channelId: string, thunkAPI) => {
        Client.getTasks(channelId).then((result) => {
            logDebug('result:', result);
            return result;
        });
    },
);

const taskSlice = createSlice({
    name: 'tasks',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        // Add reducers for additional action types here, and handle loading state as needed
        builder.addCase(fetchTasksId.fulfilled, (state, action) => {
            const list = action.payload;
            // add user to the state array
            state.entities = list as unknown as TasksType[];
        });
    },
});

// export const {} = taskSlice.actions;
export default taskSlice.reducer;
