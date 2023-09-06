/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
import React, {useCallback, useEffect, useMemo, useState} from 'react';

import {useDispatch} from 'react-redux';
import {
    Alert,
    Button,
    OverlayTrigger,
    Panel,
    Table,
    Tooltip,
} from 'react-bootstrap';
import {Channel} from 'mattermost-redux/types/channels';

import Client from '@/client';
import {TasksType} from '@/types';

import {logDebug} from '@/utils/log';

import Loader from '@/components/loader';

import NewTaskForm from './NewTaskForm';

// @ts-ignore
const PostUtils = window.PostUtils; // must be accessed through `window`
interface Props {
    channel: Channel;
    setTask: React.Dispatch<React.SetStateAction<TasksType | null>>;
}

export default function TasksTable({channel, setTask}: Props) {
    logDebug('TasksTable Rendering');
    const dispatch = useDispatch();
    const [togglePanel, setTogglePanel] = useState<boolean | undefined>(false);
    const [taskResult, setTaskResult] = useState<TasksType[]>([]);

    useEffect(() => {
        if (channel.id) {
            Client.getTasks(channel.id).then((result) => {
                setTaskResult(result);
                logDebug('result:', result);
            });
        }
    }, [channel.id]);

    const handdleTaskIdClick = useCallback(
        (task: TasksType) => () => {
            logDebug('task Click', task);
            setTask(task);
        },
        [setTask],
    );
    const tooltip = useMemo(
        () => <Tooltip id='tooltip'>{'새로운 작업을 추가합니다.'}</Tooltip>,
        [],
    );

    return (
        <>
            <div className='title-bar' style={{height: '50px'}}>
                <div className='title-bar-left' style={{float: 'left'}}>
                    <Alert bsStyle='warning'>
                        <strong>{channel.display_name}</strong>
                        {'채널의 작업 목록을 표시합니다.'}
                    </Alert>
                </div>
                <div className='title-bar-right' style={{float: 'right'}}>
                    <OverlayTrigger placement='left' overlay={tooltip}>
                        <Button onClick={() => setTogglePanel(!togglePanel)}>
                            {'New'}
                        </Button>
                    </OverlayTrigger>
                </div>
            </div>
            {togglePanel && (
                <Panel id='collapsible-panel-example-1'>
                    <Panel.Heading>{'새로운 작업을 생성합니다.'}</Panel.Heading>
                    <Panel.Body>
                        <NewTaskForm channel={channel} />
                    </Panel.Body>
                </Panel>
            )}

            <Loader />
            <Loader loading={true} />

            <Table striped={true} bordered={true} condensed={true} hover={true}>
                <thead>
                    <tr>
                        <th>{'#'}</th>
                        <th>{'Task ID'}</th>
                        <th>{'Title'}</th>
                        <th>{'User'}</th>
                        <th>{'Created At'}</th>
                    </tr>
                </thead>
                <tbody>
                    {taskResult.reverse().map((item, index) => (
                        <tr key={item.taskId}>
                            <td>{item.num}</td>
                            <td>
                                <a onClick={handdleTaskIdClick(item)}>
                                    {item.taskId}
                                </a>
                            </td>
                            <td>
                                {PostUtils.messageHtmlToComponent(
                                    PostUtils.formatText(item.taskTitle),
                                )}
                            </td>
                            <td>
                                {PostUtils.messageHtmlToComponent(
                                    PostUtils.formatText(item.userName),
                                )}
                            </td>
                            <td>{item.createAt}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </>
    );
}
