import React from 'react';

interface Props {
    style?: React.CSSProperties;
}

export default function TaskIcon({style = {fontSize: '18px'}}: Props) {
    return (
        <i
            className='glyphicon glyphicon-check'
            style={style}
            aria-hidden={true}
        />
    );
}
