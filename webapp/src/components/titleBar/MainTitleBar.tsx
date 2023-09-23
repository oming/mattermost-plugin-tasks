import React, {useCallback, useMemo} from 'react';
import {
    Alert,
    Button,
    OverlayTrigger,
    Tooltip as RBTooltip,
} from 'react-bootstrap';
interface Props {
    title: string;
    onEventCallback: () => void;
}

export default function MainTitleBar({
    title,
    onEventCallback,
}: Props): React.ReactElement {
    const handleButtonCallback = useCallback(() => {
        onEventCallback();
    }, [onEventCallback]);

    const tooltip = useMemo(
        () => <RBTooltip id='tooltip'>{'새로운 작업을 추가합니다.'}</RBTooltip>,
        [],
    );

    return (
        <div className='title-bar' style={{height: '50px'}}>
            <div className='title-bar-left' style={{float: 'left'}}>
                <Alert bsStyle='warning'>
                    <strong>{title}</strong>
                    {'채널의 작업 목록을 표시합니다.'}
                </Alert>
            </div>
            <div className='title-bar-right' style={{float: 'right'}}>
                <OverlayTrigger placement='left' overlay={tooltip}>
                    <Button onClick={handleButtonCallback}>{'New'}</Button>
                </OverlayTrigger>
            </div>
        </div>
    );
}
