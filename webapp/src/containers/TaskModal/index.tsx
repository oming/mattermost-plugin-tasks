import React, {useCallback, useEffect, useMemo} from 'react';

import {
    globalModalClose,
    reset as globalReset,
    globalSliceSelector,
} from '@/reducers/globalSlice';

import {logInfo} from '@/utils/log';
import {useAppDispatch, useAppSelector} from '@/hooks';
import Header from '@/components/modal/Header';
import Body from '@/components/modal/Body';
import Modal from '@/components/modal';
import TadaIcon from '@/components/icons/TadaIcon';
import Detail from '../Detail';
import Main from '../Main';

import {reset as taskReset} from '@/reducers/taskSlice';
import {reset as jobReset} from '@/reducers/jobSlice';

export default function TaskModal(props: any) {
    const dispatch = useAppDispatch();
    const {visible, step, channel} = useAppSelector(globalSliceSelector);
    useEffect(() => {
        logInfo('useEffect TaskModal');
        return () => {
            dispatch(globalReset());
            dispatch(taskReset());
            dispatch(jobReset());
        };
    }, [dispatch]);

    const handleModalHide = useCallback(() => {
        dispatch(globalModalClose());
        dispatch(globalReset());
        dispatch(taskReset());
        dispatch(jobReset());
    }, [dispatch]);

    const headerTitle = useMemo(() => {
        // Tasks::Town-Squore
        // Tasks::Town-Squore::xAdfjsofowdkfoxojowef

        let title = 'Tasks::';
        title += channel.display_name;
        if (step.task) {
            title += '::' + step.task.taskId;
        }
        return title;
    }, [channel, step]);

    let template;
    if (step.type === 'task') {
        template = <Main />;
    } else if (step.type === 'job' && step.task) {
        template = <Detail />;
    } else {
        template = <TadaIcon />;
    }

    return (
        <>
            {visible && (
                <Modal show={visible} onEventCallback={handleModalHide}>
                    <Header title={headerTitle} />
                    <Body>{template}</Body>
                </Modal>
            )}
        </>
    );
}
