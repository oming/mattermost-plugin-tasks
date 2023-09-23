import {combineReducers} from 'redux';
import {configureStore} from '@reduxjs/toolkit';

import globalSlice from './globalSlice';
import taskSlice from './taskSlice';
import jobSlice from './jobSlice';

const reducers = combineReducers({
    globalSlice,
    taskSlice,
    jobSlice,
});

export default reducers;
export const store = configureStore({
    reducer: {
        ...reducers,
    },
});

// useSelector 사용시 타입으로 사용하기 위함
export type RootState = ReturnType<typeof store.getState>;

// useDispatch를 좀 더 명확하게 사용하기 위함
export type AppDispatch = typeof store.dispatch;
