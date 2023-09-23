/* eslint-disable no-console */

import {id as pluginId} from '../manifest';

export function logErr(...args: unknown[]) {
    console.error(`${pluginId}:`, ...args);
}

export function logWarn(...args: unknown[]) {
    console.warn(`${pluginId}:`, ...args);
}

export function logInfo(...args: unknown[]) {
    console.info(`${pluginId}:`, ...args);
}

export function logDebug(...args: unknown[]) {
    // TODO: convert to debug once we are out of beta.
    console.debug(`${pluginId}:`, ...args);
}
