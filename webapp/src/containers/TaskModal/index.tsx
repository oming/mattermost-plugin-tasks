/* eslint-disable dot-location */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
import React, {useCallback, useEffect, useState} from 'react';

import {useSelector, useDispatch} from 'react-redux';

import {getCurrentChannel} from 'mattermost-redux/selectors/entities/channels';

import {Button, Modal} from 'react-bootstrap';

import {GlobalState} from 'mattermost-redux/types/store';

import {Channel} from 'mattermost-redux/types/channels';

import {TasksType} from '@/types';

import {globalModalClose, setChannel, reset} from '@/reducers/globalModal';
import JobsTable from '../Detail/JobsTable';
import TasksTable from '../Main/TasksTable';
import usePluginState from '@/hooks/usePluginState';
import {logDebug} from '@/utils/log';
import useChannel from '@/hooks/useChannel';

export default function TasksModal(props: any) {
    logDebug('TasksModal Rendering ', props);

    const dispatch = useDispatch();
    const globalModalState = useSelector<GlobalState >(
        (state) => logDebug('state...', state),
    );
    const [step, setStep] = useState<string>('tasks');
    const [task, setTask] = useState<TasksType | null>(null);

    const {channel} = useChannel();

    const {visible: isModalVisible, reload} = usePluginState();

    useEffect(() => {
        logDebug('TasksModal Init');
        dispatch(setChannel(channel));
        return () => {
            logDebug('TasksModal Close');
            dispatch(reset());
        };
    }, [channel, dispatch]);

    const handleStepBackwardClick = useCallback(
        (event: React.MouseEvent<Button> | undefined): void => {
            if (event) {
                setTask(null);
                setStep('tasks');
            }
        },
        [],
    );

    const handleModalHide = useCallback(() => {
        logDebug('TasksModal Closed.');
        dispatch(globalModalClose());
        dispatch(reset());
    }, [dispatch]);

    if (!channel) {
        logDebug('TasksModal Channel is Empty', channel);
        return <></>;
    }

    let template;
    if (step === 'tasks' && task === null) {
        template = <TasksTable channel={channel} setTask={setTask} />;
    } else if (task) {
        template = (
            <JobsTable
                task={task}
                handleStepBackwardClick={handleStepBackwardClick}
            />
        );
    } else {
        template = <></>;
    }

    logDebug('TasksModal Rander Start');
    return (
        <>
            <Modal
                bsSize='large'
                aria-labelledby='contained-modal-title-lg'
                show={isModalVisible}
                onHide={handleModalHide}
            >
                <Modal.Header closeButton={true}>
                    <Modal.Title>
                        {'Tasks:: ' + channel.display_name}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>{template}</Modal.Body>
            </Modal>
        </>
    );
}
