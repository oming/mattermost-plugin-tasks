import React, {useCallback, useEffect} from 'react';

import {Alert} from 'react-bootstrap';

import Loader from '@/components/loader';

import {useAppDispatch, useAppSelector} from '@/hooks';

import {globalSliceSelector} from '@/reducers/globalSlice';

import {
    fetchTaskByChannelId,
    setShowPanel,
    taskSliceSelector,
} from '@/reducers/taskSlice';

import Panel from '@/components/panel';

import {MainTitleBar} from '@/components/titleBar';

import NewTaskForm from './NewTaskForm';
import Table from './Table';

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
            <Table channel={channel} entities={entities} editable={!direct} />
        </>
    );
}
