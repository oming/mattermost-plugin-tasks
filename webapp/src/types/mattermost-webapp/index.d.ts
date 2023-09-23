// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type React from 'react';

import type {Channel, ChannelMembership} from '@mattermost/types/channels';

type ReactResolvable = React.ReactNode | React.ElementType;

export interface PluginRegistry {
    registerPostTypeComponent(
        typeName: string,
        component: ReactResolvable,
    ): any;
    registerReducer(reducer: Reducer);
    registerChannelHeaderButtonAction(
        icon: ReactResolvable,
        action: (channel: Channel) => void,
        dropdownText: string,
        tooltipText: string,
    ): any;
    registerChannelHeaderMenuAction(
        component: React.ElementType,
        fn: (channelID: string) => void,
    );
    registerChannelIntroButtonAction(
        icon: ReactResolvable,
        action: () => void,
        tooltipText: string,
    ): any;
    registerPostDropdownMenuAction(
        text: ReactResolvable,
        action?: (...args: any) => void,
        filter?: (id: string) => boolean,
    ): any;
    registerCustomRoute(route: string, component: ReactResolvable): any;
    registerProductRoute(route: string, component: ReactResolvable): any;
    unregisterComponent(componentId: string): any;
    registerProduct(
        baseURL: string,
        switcherIcon: string,
        switcherText: string,
        switcherLinkURL: string,
        mainComponent: ReactResolvable,
        headerCentreComponent: ReactResolvable,
        headerRightComponent: ReactResolvable,
        showTeamSidebar: boolean,
        showAppBar: boolean,
        wrapped: boolean,
        publicComponent: ReactResolvable | null,
    ): any;
    registerPostWillRenderEmbedComponent(
        match: (embed: {type: string; data: any}) => void,
        component: any,
        toggleable: boolean,
    ): any;
    registerWebSocketEventHandler(
        event: string,
        handler: (e: any) => void,
    ): any;
    unregisterWebSocketEventHandler(event: string): any;
    registerAppBarComponent(
        iconURL: string,
        action: (channel: Channel, member: ChannelMembership) => void,
        tooltipText: React.ReactNode,
    ): any;
    registerRightHandSidebarComponent(
        component: ReactResolvable,
        title: ReactResolvable,
    ): any;
    registerRootComponent(component: ReactResolvable): any;
    registerInsightsHandler(
        handler: (
            timeRange: string,
            page: number,
            perPage: number,
            teamId: string,
            insightType: string,
        ) => void,
    ): any;
    registerSiteStatisticsHandler(handler: () => void): any;

    registerActionAfterChannelCreation(component: ReactResolvable): any;
    registerSlashCommandWillBePostedHook(
        hook: (
            message: string,
            args: CommandArgs,
        ) => SlashCommandWillBePostedReturn,
    );

    // Add more if needed from https://developers.mattermost.com/extend/plugins/webapp/reference
}
