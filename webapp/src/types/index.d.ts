export type GlobalModalState = {
    visible: boolean;
    channel: Channel | undefined;
    step: 'task' | 'job';
    reload: boolean;
};

export type TasksType = {
    num: number;
    taskId: string;
    taskTitle: string;
    userName: string;
    createAt: number;
    updateAt: number;
    deleteAt: number;
};

export type TasksState = {
    entities: TasksType[];
    loading: boolean;
    currentRequestId: string | undefined;
    error: string | undefined;
};

export type JobsType = {
    num: number;
    jobId: string;
    jobTitle: string;
    jobContent: string;
    jobStatus: string;
    userName: string;
    createAt: number;
    updateAt: number;
    deleteAt: number;
};
