/* eslint-disable @typescript-eslint/no-explicit-any */
import {getConfig} from 'mattermost-redux/selectors/entities/general';
export const getServerRoute = (state: any) => {
    const config = getConfig(state);

    let basePath = '';
    if (config && config.SiteURL) {
        basePath = new URL(config.SiteURL).pathname;

        if (basePath && basePath[basePath.length - 1] === '/') {
            basePath = basePath.substr(0, basePath.length - 1);
        }
    }

    return basePath;
};

export function timeToStr(milliseconds: number): string {
    if (milliseconds) {
        const date = new Date(milliseconds);
        return (
            date.getFullYear() +
            '-' +
            ('0' + (date.getMonth() + 1)).slice(-2) +
            '-' +
            ('0' + date.getDate()).slice(-2) +
            ' ' +
            date.getHours() +
            ':' +
            ('0' + date.getMinutes()).slice(-2) +
            ':' +
            date.getSeconds()
        );
    }
    return '-';
}
// @ts-ignore
const PostUtils = window.PostUtils; // must be accessed through `window`
export function mmComponent(args: any): string | React.Component {
    return PostUtils.messageHtmlToComponent(PostUtils.formatText(args));
}
