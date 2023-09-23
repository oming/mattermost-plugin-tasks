import React, {useCallback} from 'react';

import {
    Button,
    ControlLabel,
    Form,
    FormControl,
    FormGroup,
} from 'react-bootstrap';

import {Controller, useForm} from 'react-hook-form';

import {Channel} from 'mattermost-redux/types/channels';

// import {DayPicker} from 'react-day-picker';

import {Row} from 'react-table';

import {useAppDispatch} from '@/hooks';
import {fetchUpdateTask} from '@/reducers/taskSlice';
import {TaskType} from '@/types';

interface FormData {
    channelId: string;
    taskId: string;
    taskTitle: string;
}

interface Props {
    channel: Channel;
    row: Row<TaskType>;
}
export default function ModifyTaskForm({channel, row: {original}}: Props) {
    const dispatch = useAppDispatch();
    const task = original;

    const {
        handleSubmit,
        formState: {errors},
        control,
    } = useForm<FormData>({
        defaultValues: {
            channelId: channel.id,
            taskId: task.taskId,
            taskTitle: task.taskTitle,
        },
    });
    const onSubmit = useCallback(
        (formValues: FormData) => {
            if (formValues) {
                dispatch(fetchUpdateTask(formValues));
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
                <code>{JSON.stringify({task}, null, 2)}</code>
            </pre>
            <hr />
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
                    defaultValue={task.taskTitle}
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
