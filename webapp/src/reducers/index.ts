import {combineReducers} from 'redux';

import taskSlice from './tasks';

import globalModal from './globalModal';

export default combineReducers({
    globalModal,
    taskSlice,
});
