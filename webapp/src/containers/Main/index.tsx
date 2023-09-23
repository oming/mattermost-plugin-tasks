/* eslint-disable react/prop-types */
import React, {useCallback, useEffect, useMemo} from 'react';

import {Alert} from 'react-bootstrap';

import {Column} from 'react-table';

import Loader from '@/components/loader';

import {useAppDispatch, useAppSelector} from '@/hooks';

import {globalSliceSelector, setStep} from '@/reducers/globalSlice';

import {
    fetchDelteTask,
    fetchTaskByChannelId,
    setShowPanel,
    taskSliceSelector,
} from '@/reducers/taskSlice';

import Panel from '@/components/panel';

import {MainTitleBar} from '@/components/titleBar';

import Table from '../Table';

import {mmComponent, timeToStr} from '@/utils/utils';
import {TaskType} from '@/types';

import NewTaskForm from './NewTaskForm';
import ModifyTaskForm from './ModifyTaskForm';
// import Table from './Table';

export default function Main() {
    const dispatch = useAppDispatch();

    const {channel, direct} = useAppSelector(globalSliceSelector);
    const {loading, entities, showPanel, reload} =
        useAppSelector(taskSliceSelector);

    useEffect(() => {
        if (channel) {
            dispatch(fetchTaskByChannelId(channel.id));
        }
    }, [channel, reload, dispatch]);

    const handdleNewTaskButtonClick = useCallback(() => {
        if (showPanel) {
            dispatch(setShowPanel(false));
        } else {
            dispatch(setShowPanel(true));
        }
    }, [dispatch, showPanel]);

    const handdleTaskIdClick = useCallback(
        (task: TaskType) => () => {
            dispatch(setStep({type: 'job', task}));
        },
        [dispatch],
    );

    const handdleTaskDeleteClick = useCallback(
        (task: TaskType) => () => {
            dispatch(
                fetchDelteTask({
                    channelId: channel.id,
                    taskId: task.taskId,
                }),
            );
        },
        [channel.id, dispatch],
    );

    const columns = useMemo<Column<TaskType>[]>(
        () => [
            {
                Header: '#',
                accessor: 'num',
                maxWidth: 50,
            },
            {
                Header: 'Title',
                accessor: 'taskTitle',
                Cell: ({row: {original}, cell: {value}}) => {
                    return (
                        <a onClick={handdleTaskIdClick(original)}>
                            {mmComponent(value)}
                        </a>
                    );
                },
                disableSortBy: true,
            },
            {
                Header: 'User',
                accessor: 'userName',
                Cell: ({cell: {value}}) => mmComponent(value),
                // Filter: selectColumnFilter,
                // filter: 'includes',
                disableSortBy: true,
            },
            {
                Header: 'Created At',
                accessor: 'createAt',
                Cell: ({cell: {value}}) => timeToStr(value),
                maxWidth: 150,
            },
        ],
        [handdleTaskIdClick],
    );

    return (
        <>
            {direct ? (
                <Alert bsStyle='danger'>
                    <h4>{'Register tasks from messages.'}</h4>
                    <p>
                        {'Select a '} <strong>{'task title'}</strong>{' '}
                        {' to register the message to the task.'}
                    </p>
                </Alert>
            ) : (
                <MainTitleBar
                    title={channel.display_name}
                    onEventCallback={handdleNewTaskButtonClick}
                />
            )}
            {showPanel && (
                <Panel headerTitle='새로운 작업을 생성합니다.'>
                    <NewTaskForm channel={channel} />
                </Panel>
            )}
            <Loader loading={loading} message='데이터 로딩중입니다.' />
            <Table
                columns={columns}
                data={entities}
                handleDeleteClick={handdleTaskDeleteClick}
                renderModifyComponent={(data) => (
                    <ModifyTaskForm channel={channel} row={data} />
                )}
                editable={!direct}
            />
        </>
    );
}
