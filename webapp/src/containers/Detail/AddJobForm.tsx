/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
import React, {useCallback} from 'react';

import {
    Button,
    ControlLabel,
    Form,
    FormControl,
    FormGroup,
} from 'react-bootstrap';

import {GlobalState} from 'mattermost-redux/types/store';
import {Controller, useForm} from 'react-hook-form';

import Client from '@/client';
import {TasksType} from '@/types';
import {logDebug} from '@/utils/log';
interface Props {
    task: TasksType;
}

interface FormData {
    taskId: string;
    jobTitle: string;
    jobContent: string;
}
export default function AddJobForm({task}: Props) {
    logDebug('AddJobForm Rendering');

    const {
        handleSubmit,
        formState: {errors},
        control,
    } = useForm<FormData>({
        defaultValues: {
            taskId: task.task_id,
            jobTitle: '',
            jobContent: '',
        },
    });

    const onSubmit = useCallback((formValues: FormData) => {
        if (formValues) {
            logDebug('formValues', formValues);
            Client.postJobs({
                task_id: formValues.taskId,
                job_title: formValues.jobTitle,
                job_content: formValues.jobContent,
            }).then((result) => {
                logDebug('result:', result);
            });
        }
    }, []);

    return (
        <Form onSubmit={handleSubmit(onSubmit)}>
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
                    defaultValue=''
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
                    defaultValue=''
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
