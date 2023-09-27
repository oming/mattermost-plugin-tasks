import React, {useCallback} from 'react';

import {
    Button,
    ControlLabel,
    Form,
    FormControl,
    FormGroup,
} from 'react-bootstrap';

import {Controller, useForm} from 'react-hook-form';

import {Row} from 'react-table';

import {Channel} from 'mattermost-redux/types/channels';

import {JobType, ReqUpdateJobType, TaskType} from '@/types';
import {useAppDispatch} from '@/hooks';
import {fetchUpdateJob} from '@/reducers/jobSlice';
interface Props {
    channel: Channel;
    task: TaskType;
    row: Row<JobType>;
}

export default function ModifyJobForm({channel, task, row: {original}}: Props) {
    const dispatch = useAppDispatch();
    const job = original;

    const {
        handleSubmit,
        formState: {errors},
        control,
    } = useForm<ReqUpdateJobType>({
        defaultValues: {
            channelId: channel.id,
            taskId: task.taskId,
            jobId: job.jobId,
            jobTitle: job.jobTitle,
            jobContent: job.jobContent,
        },
    });

    const onSubmit = useCallback(
        (formValues: ReqUpdateJobType) => {
            if (formValues) {
                dispatch(fetchUpdateJob(formValues));
            }
        },
        [dispatch],
    );

    return (
        <Form onSubmit={handleSubmit(onSubmit)}>
            <pre
                style={{
                    fontSize: '10px',
                }}
            >
                <code>{JSON.stringify({job}, null, 2)}</code>
            </pre>
            <hr />
            <FormGroup
                controlId='formControlsText'
                validationState={errors.jobTitle && 'error'}
            >
                <ControlLabel>{'할일 제목'}</ControlLabel>
                <Controller
                    render={({field: {onChange, onBlur, value, ref}}) => (
                        <FormControl
                            type='text'
                            placeholder='Job Title'
                            onBlur={onBlur}
                            onChange={onChange}
                            value={value}
                            inputRef={ref}
                        />
                    )}
                    name='jobTitle'
                    control={control}
                    defaultValue={job.jobTitle}
                    rules={{
                        required: '필수 값 입니다.',
                        minLength: {
                            value: 5,
                            message: '최소 5자 이상 입력하시오.',
                        },
                    }}
                />

                <FormControl.Feedback />
                {errors.jobTitle && (
                    <p className='text-danger'>{errors.jobTitle.message}</p>
                )}
            </FormGroup>
            <FormGroup
                controlId='formControlsTextarea'
                validationState={errors.jobContent && 'error'}
            >
                <ControlLabel>{'할일 내용'}</ControlLabel>
                <Controller
                    render={({field: {onChange, onBlur, value, ref}}) => (
                        <FormControl
                            componentClass='textarea'
                            placeholder='textarea'
                            onBlur={onBlur}
                            onChange={onChange}
                            value={value}
                            inputRef={ref}
                        />
                    )}
                    name='jobContent'
                    control={control}
                    defaultValue={job.jobContent}
                    rules={{
                        required: '필수 값 입니다.',
                        minLength: {
                            value: 5,
                            message: '최소 5자 이상 입력하시오.',
                        },
                    }}
                />
                <FormControl.Feedback />
                {errors.jobContent && (
                    <p className='text-danger'>{errors.jobContent.message}</p>
                )}
            </FormGroup>
            <Button type='submit'>{'Submit'}</Button>
        </Form>
    );
}
