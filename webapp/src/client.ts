/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable import/no-named-as-default */
/* eslint-disable import/no-unresolved */
import {Client4} from 'mattermost-redux/client';

import {ClientError} from 'mattermost-redux/client/client4';

import {id as pluginId} from './manifest';
import {
    ReqDeleteTaskType,
    ReqListJobType,
    ReqNewJobType,
    ReqNewTaskType,
    ReqRemoveJobType,
    ReqShowTaskType,
    ReqStatusJobType,
    ReqUpdateJobType,
    ReqUpdateTaskType,
} from './types';

class ClientClass {
    url = '';

    setServerRoute(url: string) {
        this.url = url + `/plugins/${pluginId}`;
    }

    getConfig = async () => {
        return this.doGet(`${this.url}/config`);
    };

    httpShowTask = async ({channelId}: ReqShowTaskType) => {
        return this.doGet(`${this.url}/${channelId}/tasks`);
    };

    httpNewTask = async ({channelId, taskTitle}: ReqNewTaskType) => {
        return this.doPost(`${this.url}/${channelId}/tasks`, {taskTitle});
    };

    httpUpdateTask = async ({
        channelId,
        taskId,
        taskTitle,
    }: ReqUpdateTaskType) => {
        return this.doPut(`${this.url}/${channelId}/tasks/${taskId}`, {
            taskTitle,
        });
    };

    httpDeleteTask = async ({channelId, taskId}: ReqDeleteTaskType) => {
        return this.doDelete(`${this.url}/${channelId}/tasks/${taskId}`);
    };

    httpListJob = async ({channelId, taskId}: ReqListJobType) => {
        return this.doGet(`${this.url}/${channelId}/tasks/${taskId}/jobs`);
    };

    httpAddJob = async ({
        channelId,
        taskId,
        jobTitle,
        jobContent,
    }: ReqNewJobType) => {
        return this.doPost(`${this.url}/${channelId}/tasks/${taskId}/jobs`, {
            jobTitle,
            jobContent,
        });
    };

    httpUpdateJob = async ({
        channelId,
        taskId,
        jobId,
        jobTitle,
        jobContent,
    }: ReqUpdateJobType) => {
        return this.doPut(
            `${this.url}/${channelId}/tasks/${taskId}/jobs/${jobId}`,
            {
                jobTitle,
                jobContent,
            },
        );
    };

    httpRemoveJob = async ({channelId, taskId, jobId}: ReqRemoveJobType) => {
        return this.doDelete(
            `${this.url}/${channelId}/tasks/${taskId}/jobs/${jobId}`,
        );
    };

    httpStatusJob = async ({
        channelId,
        taskId,
        jobId,
        jobStatus,
    }: ReqStatusJobType) => {
        return this.doPut(
            `${this.url}/${channelId}/tasks/${taskId}/jobs/${jobId}/status`,
            {
                jobStatus,
            },
        );
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
