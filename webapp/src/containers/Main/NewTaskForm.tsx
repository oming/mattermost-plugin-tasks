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
import {Channel} from 'mattermost-redux/types/channels';

import {Controller, useForm} from 'react-hook-form';

import Client from '@/client';
import {logDebug} from '@/utils/log';
interface Props {
    channel: Channel;
}

interface FormData {
    channelId: string;
    taskTitle: string;
}
export default function NewTaskForm({channel}: Props) {
    logDebug('NewTaskForm Rendering');

    const {
        register,
        handleSubmit,
        watch,
        formState: {errors},
        control,
    } = useForm<FormData>({
        defaultValues: {
            channelId: channel.id,
            taskTitle: '',
        },
    });
    const onSubmit = useCallback((formValues: FormData) => {
        if (formValues) {
            logDebug('formValues', formValues);
            Client.postTasks({
                channel_id: formValues.channelId,
                task_title: formValues.taskTitle,
            }).then((result) => {
                logDebug('result:', result);
            });
        }
    }, []);

    return (
        <Form onSubmit={handleSubmit(onSubmit)}>
            <FormGroup
                controlId='formBasicText'
                validationState={errors.taskTitle && 'error'}
            >
                <ControlLabel>{'작업 제목'}</ControlLabel>
                <Controller
                    render={({field: {onChange, onBlur, value, name, ref}}) => (
                        <FormControl
                            type='text'
                            placeholder='Task Title'
                            onBlur={onBlur}
                            onChange={onChange}
                            value={value}
                            inputRef={ref}
                        />
                    )}
                    name='taskTitle'
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
                {errors.taskTitle && (
                    <p className='text-danger'>{errors.taskTitle.message}</p>
                )}
            </FormGroup>
            <Button type='submit'>{'Submit'}</Button>
        </Form>
    );
}
