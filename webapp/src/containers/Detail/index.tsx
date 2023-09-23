/* eslint-disable react/prop-types */
import React, {useCallback, useEffect, useMemo} from 'react';

import {Column} from 'react-table';

import Panel from '@/components/panel';

import {DetailTitleBar} from '@/components/titleBar';

import Loader from '@/components/loader';
import {useAppDispatch, useAppSelector} from '@/hooks';
import {
    jobSliceSelector,
    fetchJobByTaskId,
    setShowPanel,
    reset as jobReset,
    fetchRemoveJob,
    fetchStatusJob,
} from '@/reducers/jobSlice';

import {globalSliceSelector, setStep} from '@/reducers/globalSlice';

import Table from '../Table';

import {JobType} from '@/types';

import {mmComponent, timeToStr} from '@/utils/utils';

import Status from '@/components/status';

import AddJobForm from './AddJobForm';
import ModifyJobForm from './ModifyJobForm';

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

    const handdleStatusToggle = useCallback(
        (job: JobType) => () => {
            if (task && !direct) {
                dispatch(
                    fetchStatusJob({
                        taskId: task.taskId,
                        jobId: job.jobId,
                        jobStatus: job.jobStatus === 'open' ? 'done' : 'open',
                    }),
                );
            }
        },
        [direct, dispatch, task],
    );

    const handdleJobDeleteClick = useCallback(
        (job: JobType) => () => {
            if (task) {
                dispatch(
                    fetchRemoveJob({taskId: task.taskId, jobId: job.jobId}),
                );
            }
        },
        [dispatch, task],
    );
    const columns = useMemo<Column<JobType>[]>(
        () => [
            {
                Header: '#',
                accessor: 'num',
                maxWidth: 50,
            },
            {
                Header: 'Title',
                accessor: 'jobTitle',
                Cell: ({cell: {value}}) => mmComponent(value),
                disableSortBy: true,
            },
            {
                Header: 'Content',
                accessor: 'jobContent',
                Cell: ({cell: {value}}) => mmComponent(value),
                disableSortBy: true,
            },
            {
                Header: 'Status',
                accessor: 'jobStatus',
                Cell: ({row: {original}, cell: {value}}) => {
                    return (
                        <Status
                            status={value}
                            onEventCallback={handdleStatusToggle(original)}
                        />
                    );
                },
                disableSortBy: true,
            },
            {
                Header: 'User',
                accessor: 'userName',
                Cell: ({cell: {value}}) => mmComponent(value),
                disableSortBy: true,
            },
            {
                Header: 'Created At',
                accessor: 'createAt',
                Cell: ({cell: {value}}) => timeToStr(value),
                maxWidth: 150,
            },
        ],
        [handdleStatusToggle],
    );

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
            <Table
                columns={columns}
                data={entities}
                handleDeleteClick={handdleJobDeleteClick}
                renderModifyComponent={(data) => (
                    <ModifyJobForm task={task} row={data} />
                )}
                editable={!direct}
            />
        </>
    );
}
