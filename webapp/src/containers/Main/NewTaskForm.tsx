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

import {useAppDispatch} from '@/hooks';
import {fetchNewTask} from '@/reducers/taskSlice';
import {ReqNewTaskType} from '@/types';
interface Props {
    channel: Channel;
}
export default function NewTaskForm({channel}: Props) {
    const dispatch = useAppDispatch();

    const {
        handleSubmit,
        formState: {errors},
        control,
    } = useForm<ReqNewTaskType>({
        defaultValues: {
            channelId: channel.id,
            taskTitle: '',
        },
    });
    const onSubmit = useCallback(
        (formValues: ReqNewTaskType) => {
            if (formValues) {
                dispatch(fetchNewTask(formValues));
            }
        },
        [dispatch],
    );

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
