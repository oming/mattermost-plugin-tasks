import React, {useCallback, useEffect} from 'react';

import Panel from '@/components/panel';

import {DetailTitleBar} from '@/components/titleBar';

import Loader from '@/components/loader';
import {useAppDispatch, useAppSelector} from '@/hooks';
import {
    jobSliceSelector,
    fetchJobByTaskId,
    setShowPanel,
    reset as jobReset,
} from '@/reducers/jobSlice';

import {globalSliceSelector, setStep} from '@/reducers/globalSlice';

import AddJobForm from './AddJobForm';
import Table from './Table';

export default function Detail() {
    const dispatch = useAppDispatch();

    const {loading, entities, showPanel, reload} =
        useAppSelector(jobSliceSelector);
    const {
        step: {task},
        direct,
    } = useAppSelector(globalSliceSelector);

    useEffect(() => {
        if (task) {
            dispatch(fetchJobByTaskId(task.taskId));
        }
        if (direct) {
            dispatch(setShowPanel(true));
        }
    }, [direct, dispatch, reload, task]);

    const handleStepBackwardClick = useCallback(() => {
        dispatch(setStep({type: 'task'}));
        dispatch(jobReset());
    }, [dispatch]);

    const handdleNewJobButtonClick = useCallback(() => {
        if (showPanel) {
            dispatch(setShowPanel(false));
        } else {
            dispatch(setShowPanel(true));
        }
    }, [dispatch, showPanel]);

    if (!task) {
        return <></>;
    }

    return (
        <>
            <DetailTitleBar
                title={task.taskTitle}
                onBackEventCallback={handleStepBackwardClick}
                onAddEventCallback={handdleNewJobButtonClick}
            />

            {showPanel && (
                <Panel headerTitle='새로운 할일을 추가합니다.'>
                    <AddJobForm task={task} direct={direct} />
                </Panel>
            )}

            <Loader loading={loading} message='데이터 로딩중입니다.' />
            <Table task={task} entities={entities} editable={!direct} />
        </>
    );
}
