/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable import/no-named-as-default */
/* eslint-disable import/no-unresolved */
import {Client4} from 'mattermost-redux/client';

import {ClientError} from 'mattermost-redux/client/client4';

import {id as pluginId} from './manifest';
import {
    ReqChannelIdType,
    ReqDeleteTaskType,
    ReqJobIdType,
    ReqNewJobType,
    ReqNewTaskType,
    ReqRemoveJobType,
    ReqStatusJobType,
    ReqTaskIdType,
} from './types';

class ClientClass {
    url = '';

    setServerRoute(url: string) {
        this.url = url + `/plugins/${pluginId}`;
    }

    getConfig = async () => {
        return this.doGet(`${this.url}/config`);
    };

    httpShowTask = async (channelId: ReqChannelIdType) => {
        return this.doGet(`${this.url}/t/${channelId}/tasks`);
    };

    httpNewTask = async ({channelId, taskTitle}: ReqNewTaskType) => {
        return this.doPost(`${this.url}/t/${channelId}/tasks`, {taskTitle});
    };

    httpUpdateTask = async ({
        channelId,
        taskId,
        taskTitle,
    }: {taskId: ReqTaskIdType} & ReqNewTaskType) => {
        return this.doPut(`${this.url}/t/${channelId}/tasks/${taskId}`, {
            taskTitle,
        });
    };

    httpDeleteTask = async ({channelId, taskId}: ReqDeleteTaskType) => {
        return this.doDelete(`${this.url}/t/${channelId}/tasks/${taskId}`);
    };

    httpListJob = async (taskId: ReqTaskIdType) => {
        return this.doGet(`${this.url}/j/${taskId}/jobs`);
    };

    httpAddJob = async ({taskId, jobTitle, jobContent}: ReqNewJobType) => {
        return this.doPost(`${this.url}/j/${taskId}/jobs`, {
            jobTitle,
            jobContent,
        });
    };

    httpUpdateJob = async ({
        taskId,
        jobId,
        jobTitle,
        jobContent,
    }: {jobId: ReqJobIdType} & ReqNewJobType) => {
        return this.doPut(`${this.url}/j/${taskId}/jobs/${jobId}`, {
            jobTitle,
            jobContent,
        });
    };

    httpRemoveJob = async ({taskId, jobId}: ReqRemoveJobType) => {
        return this.doDelete(`${this.url}/j/${taskId}/jobs/${jobId}`);
    };

    httpStatusJob = async ({taskId, jobId, jobStatus}: ReqStatusJobType) => {
        return this.doPut(`${this.url}/j/${taskId}/jobs/${jobId}/status`, {
            jobStatus,
        });
    };

    doGet = async (url: string, headers: {[key: string]: any} = {}) => {
        headers['X-Timezone-Offset'] = new Date().getTimezoneOffset();

        const options = {
            method: 'get',
            headers,
        };

        const response = await fetch(url, Client4.getOptions(options));

        if (response.ok) {
            return response.json();
        }

        const text = await response.text();

        throw new ClientError(Client4.url, {
            message: text || '',
            status_code: response.status,
            url,
        });
    };

    doPost = async (
        url: string,
        body: any = {},
        headers: {[key: string]: any} = {},
    ) => {
        headers['X-Timezone-Offset'] = new Date().getTimezoneOffset();

        const options = {
            method: 'post',
            body: JSON.stringify(body),
            headers,
        };

        const response = await fetch(url, Client4.getOptions(options));

        if (response.ok) {
            return response.json();
        }

        const text = await response.text();

        throw new ClientError(Client4.url, {
            message: text || '',
            status_code: response.status,
            url,
        });
    };

    doDelete = async (url: string, headers: {[key: string]: any} = {}) => {
        headers['X-Timezone-Offset'] = new Date().getTimezoneOffset();

        const options = {
            method: 'delete',
            headers,
        };

        const response = await fetch(url, Client4.getOptions(options));

        if (response.ok) {
            return response.json();
        }

        const text = await response.text();

        throw new ClientError(Client4.url, {
            message: text || '',
            status_code: response.status,
            url,
        });
    };

    doPut = async (
        url: string,
        body: any,
        headers: {[key: string]: any} = {},
    ) => {
        headers['X-Timezone-Offset'] = new Date().getTimezoneOffset();

        const options = {
            method: 'put',
            body: JSON.stringify(body),
            headers,
        };

        const response = await fetch(url, Client4.getOptions(options));

        if (response.ok) {
            return response.json();
        }

        const text = await response.text();

        throw new ClientError(Client4.url, {
            message: text || '',
            status_code: response.status,
            url,
        });
    };
}

const Client = new ClientClass();

export default Client;
