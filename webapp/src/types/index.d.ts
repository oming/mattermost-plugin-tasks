import {Channel} from 'mattermost-redux/types/channels';
import {Post} from 'mattermost-redux/types/posts';
import {Team} from 'mattermost-redux/types/teams';

// 통신 에러 시 보여줄 에러 메세지의 타입
export interface MyKnownError {
    errorMessage: string;
}

export type ReqChannelIdType = string;
export type ReqNewTaskType = {
    channelId: string;
    taskTitle: string;
};
export type ReqDeleteTaskType = {
    channelId: string;
    taskId: string;
};

export type ReqTaskIdType = string;
export type ReqJobIdType = string;
export type ReqNewJobType = {
    taskId: string;
    jobTitle: string;
    jobContent: string;
};
export type ReqRemoveJobType = {
    taskId: string;
    jobId: string;
};
export type ReqStatusJobType = {
    taskId: string;
    jobId: string;
    jobStatus: string;
};

export type TaskType = {
    num: number;
    taskId: string;
    taskTitle: string;
    userName: string;
    createAt: number;
    updateAt: number;
    deleteAt: number;
};

export type TaskState = {
    entities: TaskType[];
    loading: boolean;
    error?: string;
    showPanel: boolean;
    reload: boolean;
};

export type JobType = {
    num: number;
    jobId: string;
    jobTitle: string;
    jobContent: string;
    jobStatus: 'open' | 'done';
    userName: string;
    createAt: number;
    updateAt: number;
    deleteAt: number;
};

export type JobState = {
    entities: JobType[];
    loading: boolean;
    error?: string;
    showPanel: boolean;
    reload: boolean;
};

export type DirectPostType = {
    post: Post;
    team: Team;
};
export type GlobalModalState = {
    visible: boolean;
    channel: Channel;
    step: {
        type: 'task' | 'job';
        task?: TaskType;
    };
    direct?: DirectPostType;
};
