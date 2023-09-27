import {Channel} from 'mattermost-redux/types/channels';
import {Post} from 'mattermost-redux/types/posts';
import {Team} from 'mattermost-redux/types/teams';

// 통신 에러 시 보여줄 에러 메세지의 타입
export interface MyKnownError {
    errorMessage: string;
}

export type ReqChannelIdType = string;
export type ReqTaskIdType = string;
export type ReqJobIdType = string;

export type ReqShowTaskType = {
    channelId: ReqChannelIdType;
};
export type ReqNewTaskType = {
    channelId: ReqChannelIdType;
    taskTitle: string;
};
export type ReqUpdateTaskType = {
    channelId: ReqChannelIdType;
    taskId: ReqTaskIdType;
    taskTitle: string;
};
export type ReqDeleteTaskType = {
    channelId: ReqChannelIdType;
    taskId: ReqTaskIdType;
};
export type ReqListJobType = {
    channelId: ReqChannelIdType;
    taskId: ReqTaskIdType;
};
export type ReqNewJobType = {
    channelId: ReqChannelIdType;
    taskId: ReqTaskIdType;
    jobTitle: string;
    jobContent: string;
};
export type ReqUpdateJobType = {
    channelId: ReqChannelIdType;
    taskId: ReqTaskIdType;
    jobId: ReqJobIdType;
    jobTitle: string;
    jobContent: string;
};
export type ReqRemoveJobType = {
    channelId: ReqChannelIdType;
    taskId: ReqTaskIdType;
    jobId: string;
};
export type ReqStatusJobType = {
    channelId: ReqChannelIdType;
    taskId: ReqTaskIdType;
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
