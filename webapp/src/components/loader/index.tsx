import React from 'react';

import {logDebug} from '@/utils/log';

interface Props {
    loading?: boolean;
}

export default function Loader({loading = false}: Props) {
    logDebug('loader is ', loading);
    if (loading) {
        return <div className='loader' />;
    }
    return <></>;
}
