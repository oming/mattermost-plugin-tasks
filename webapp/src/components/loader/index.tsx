import React from 'react';
interface Props {
    loading?: boolean;
    message?: string;
}

export default function Loader({
    loading = false,
    message,
}: Props): React.ReactElement {
    return (
        <>
            {loading && (
                <div className='loading'>
                    <div className='loader' />
                    {message && <div className='text'>{message}</div>}
                </div>
            )}
        </>
    );
}
