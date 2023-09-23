import React, {useCallback} from 'react';

import {
    Button,
    ControlLabel,
    Form,
    FormControl,
    FormGroup,
} from 'react-bootstrap';

import {Controller, useForm} from 'react-hook-form';

import {DirectPostType, TaskType} from '@/types';
import {useAppDispatch, useAppSelector} from '@/hooks';
import {fetchNewJob} from '@/reducers/jobSlice';
import {getServerRoute} from '@/utils/utils';
import {resetDirectPost} from '@/reducers/globalSlice';
interface Props {
    task: TaskType;
    direct?: DirectPostType;
}

interface FormData {
    taskId: string;
    jobTitle: string;
    jobContent: string;
}
export default function AddJobForm({task, direct}: Props) {
    const dispatch = useAppDispatch();

    const serverRoute = useAppSelector((state) => getServerRoute(state));
    let message = '';
    if (direct) {
        const {post, team} = direct;
        message =
            post.message +
            `\n[Permalink](${serverRoute}/${team.name}/pl/${post.id})`;
    }
    const {
        handleSubmit,
        formState: {errors},
        control,
    } = useForm<FormData>({
        defaultValues: {
            taskId: task.taskId,
            jobTitle: '',
            jobContent: message,
        },
    });

    const onSubmit = useCallback(
        (formValues: FormData) => {
            if (formValues) {
                dispatch(fetchNewJob(formValues));
                dispatch(resetDirectPost());
            }
        },
        [dispatch],
    );

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
