/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */

import React, {useEffect, useMemo, useState} from 'react';

import {useDispatch} from 'react-redux';
import {Button, OverlayTrigger, Panel, Table, Tooltip} from 'react-bootstrap';

import {JobsType, TasksType} from '@/types';
import Client from '@/client';

import {logDebug} from '@/utils/log';

import AddJobForm from './AddJobForm';

// @ts-ignore
const PostUtils = window.PostUtils; // must be accessed through `window`
interface Props {
    task: TasksType;
    handleStepBackwardClick: (
        event: React.MouseEvent<Button> | undefined,
    ) => void;
}

export default function JobsTable({task, handleStepBackwardClick}: Props) {
    logDebug('JobsTable Rendering');
    const dispatch = useDispatch();
    const [togglePanel, setTogglePanel] = useState<boolean | undefined>(false);
    const [jobResult, setJobResult] = useState<JobsType[]>([]);

    useEffect(() => {
        if (task) {
            Client.getJobs(task.taskId).then((result) => {
                setJobResult(result);
                logDebug('result:', result);
            });
        }
    }, [task]);
    const tooltipBack = useMemo(
        () => <Tooltip id='tooltip'>{'작업목록으로 돌아갑니다.'}</Tooltip>,
        [],
    );

    const tooltip = useMemo(
        () => <Tooltip id='tooltip'>{'새로운 작업을 추가합니다.'}</Tooltip>,
        [],
    );

    return (
        <>
            <div className='title-bar' style={{height: '50px'}}>
                <div className='title-bar-left' style={{float: 'left'}}>
                    <OverlayTrigger placement='right' overlay={tooltipBack}>
                        <Button onClick={handleStepBackwardClick}>
                            <i className='glyphicon glyphicon-step-backward' />
                            {'뒤로'}
                        </Button>
                    </OverlayTrigger>
                </div>
                <div
                    className='title-bar-left'
                    style={{float: 'left', marginLeft: '10px'}}
                >
                    <p>
                        {'TaskId: ' +
                            task?.taskId +
                            ', Title: ' +
                            task?.taskTitle}
                    </p>
                </div>
                <div className='title-bar-right' style={{float: 'right'}}>
                    <OverlayTrigger placement='left' overlay={tooltip}>
                        <Button onClick={() => setTogglePanel(!togglePanel)}>
                            {'Add'}
                        </Button>
                    </OverlayTrigger>
                </div>
            </div>
            {togglePanel && (
                <Panel id='collapsible-panel-example-1'>
                    <Panel.Heading>{'새로운 할일을 추가합니다.'}</Panel.Heading>
                    <Panel.Body>
                        <AddJobForm task={task} />
                    </Panel.Body>
                </Panel>
            )}

            <Table striped={true} bordered={true} condensed={true} hover={true}>
                <thead>
                    <tr>
                        <th>{'#'}</th>
                        <th>{'Job ID'}</th>
                        <th>{'Title'}</th>
                        <th>{'Content'}</th>
                        <th>{'Status'}</th>
                        <th>{'User'}</th>
                        <th>{'Created At'}</th>
                    </tr>
                </thead>
                <tbody>
                    {jobResult.reverse().map((item, index) => (
                        <tr key={item.jobId}>
                            <td>{item.num}</td>
                            <td>{item.jobId}</td>
                            <td>
                                {PostUtils.messageHtmlToComponent(
                                    PostUtils.formatText(item.jobTitle),
                                )}
                            </td>
                            <td>
                                {PostUtils.messageHtmlToComponent(
                                    PostUtils.formatText(item.jobContent),
                                )}
                            </td>
                            <td>{item.jobStatus}</td>
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
