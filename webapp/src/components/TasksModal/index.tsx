// /* eslint-disable dot-location */
// /* eslint-disable prettier/prettier */
// /* eslint-disable @typescript-eslint/no-unused-vars */
// /* eslint-disable no-console */
// import React, {useCallback, useEffect, useState} from 'react';

// import {useSelector, useDispatch} from 'react-redux';

// import {
//     getCurrentChannel,
//     getCurrentChannelId,
// } from 'mattermost-redux/selectors/entities/channels';

// import {Button, Col, Grid, Modal, Row, Table} from 'react-bootstrap';

// import {GlobalState} from 'mattermost-redux/types/store';

// import {Channel} from 'mattermost-redux/types/channels';

// import {id as pluginId} from '@/manifest';
// import {MODAL_CLOSE} from '@/action_types';
// import Client from '@/client';

// import {TasksType} from '@/types';

// import {globalModalClose} from '@/reducers/globalModal';

// import JobsTable from './JobsTable';
// import TasksTable from './TasksTable';

// //@ts-ignore GlobalState is not complete
// const pluginState = (state: GlobalState) => state['plugins-' + pluginId] || {};

// export default function TasksModal(props: any) {
//     console.log('TasksModal Rendering ', props);
//     const dispatch = useDispatch();

//     const [step, setStep] = useState<string>('tasks');
//     const [task, setTask] = useState<TasksType | null>(null);

//     const channel = useSelector<GlobalState, Channel>((state) =>
//         getCurrentChannel(state),
//     );

//     console.log('TaskModal channel', channel);
//     console.log('TaskModal step', step);
//     console.log('TaskModal task', task);
//     const show = useSelector<GlobalState, boolean>(
//         (state) => pluginState(state).globalModal.visible,
//     );

//     const handleStepBackwardClick = useCallback(
//         (event: React.MouseEvent<Button> | undefined): void => {
//             if (event) {
//                 setTask(null);
//                 setStep('tasks');
//             }
//         },
//         [],
//     );

//     const handleModalHide = useCallback(() => {
//         dispatch(globalModalClose());
//     }, [dispatch]);

//     if (!channel) {
//         console.log('TasksModal Channel is Empty', channel);
//         return <></>;
//     }

//     let template;
//     if (step === 'tasks' && task === null) {
//         template = <TasksTable channel={channel} setTask={setTask} />;
//     } else if (task) {
//         template = (
//             <JobsTable
//                 task={task}
//                 handleStepBackwardClick={handleStepBackwardClick}
//             />
//         );
//     } else {
//         template = <></>;
//     }

//     console.log('TasksModal Rander Start');
//     return (
//         <>
//             <Modal
//                 bsSize='large'
//                 aria-labelledby='contained-modal-title-lg'
//                 show={show}
//                 onHide={handleModalHide}
//             >
//                 <Modal.Header closeButton={true}>
//                     <Modal.Title>
//                         {'Tasks:: ' + channel.display_name}
//                     </Modal.Title>
//                 </Modal.Header>
//                 <Modal.Body>{template}</Modal.Body>
//             </Modal>
//         </>
//     );
// }
