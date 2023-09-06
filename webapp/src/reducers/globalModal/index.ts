import {PayloadAction, createSlice} from '@reduxjs/toolkit';

import {Channel} from 'mattermost-redux/types/channels';

import {GlobalModalState} from '@/types';

const initialState: GlobalModalState = {
    visible: false,
    channel: undefined,
    step: 'task',
    reload: false,
};

const globalModal = createSlice({
    name: 'globalModal',
    initialState,
    reducers: {
        // open(state, action: PayloadAction<GlobalModalState>) {
        globalModalOpen(state) {
            state.visible = true;
        },
        globalModalClose(state) {
            state.visible = false;
        },
        setChannel(state, action: PayloadAction<Channel>) {
            state.channel = action.payload;
        },
        setStep(state, action: PayloadAction<'task' | 'job'>) {
            state.step = action.payload;
        },
        toggleModal(state) {
            state.reload = !state.reload;
        },
        reset(state) {
            // eslint-disable-next-line no-param-reassign, @typescript-eslint/no-unused-vars
            state = initialState;
        },
    },
});

export const {
    globalModalOpen,
    globalModalClose,
    setChannel,
    setStep,
    toggleModal,
    reset,
} = globalModal.actions;
export default globalModal.reducer;
