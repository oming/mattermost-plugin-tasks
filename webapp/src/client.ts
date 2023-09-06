/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable import/no-named-as-default */
/* eslint-disable import/no-unresolved */
import {Client4} from 'mattermost-redux/client';

import {ClientError} from 'mattermost-redux/client/client4';

import {id as pluginId} from './manifest';

class ClientClass {
    url = '';

    setServerRoute(url: string) {
        this.url = url + `/plugins/${pluginId}`;
    }

    getConfig = async () => {
        return this.doGet(`${this.url}/config`);
    };

    getTasks = async (channelId: string) => {
        return this.doGet(`${this.url}/tasks?channelId=${channelId}`);
    };
    postTasks = async (payload: any) => {
        return this.doPost(`${this.url}/tasks`, payload);
    };
    deleteTasks = async (payload: any) => {
        return this.doDelete(`${this.url}/tasks`, payload);
    };

    getJobs = async (taskId: string) => {
        return this.doGet(`${this.url}/jobs?taskId=${taskId}`);
    };
    postJobs = async (payload: any) => {
        return this.doPost(`${this.url}/jobs`, payload);
    };
    deleteJobs = async (payload: any) => {
        return this.doDelete(`${this.url}/jobs`, payload);
    };
    putJobs = async (payload: any) => {
        return this.doPut(`${this.url}/jobs`, payload);
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
