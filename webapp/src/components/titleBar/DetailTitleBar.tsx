import React, {useCallback, useMemo} from 'react';
import {
    Alert,
    Button,
    OverlayTrigger,
    Tooltip as RBTooltip,
} from 'react-bootstrap';
interface Props {
    title: string;
    onBackEventCallback: () => void;
    onAddEventCallback: () => void;
}

export default function DetailTitleBar({
    title = '',
    onBackEventCallback,
    onAddEventCallback,
}: Props): React.ReactElement {
    const handleBackButtonCallback = useCallback(() => {
        onBackEventCallback();
    }, [onBackEventCallback]);

    const handleAddButtonCallback = useCallback(() => {
        onAddEventCallback();
    }, [onAddEventCallback]);

    const tooltipBack = useMemo(
        () => <RBTooltip id='tooltip'>{'작업목록으로 돌아갑니다.'}</RBTooltip>,
        [],
    );
    const tooltipAdd = useMemo(
        () => <RBTooltip id='tooltip'>{'새로운 작업을 추가합니다.'}</RBTooltip>,
        [],
    );
    return (
        <div className='title-bar' style={{height: '50px'}}>
            <div className='title-bar-left' style={{float: 'left'}}>
                <OverlayTrigger placement='right' overlay={tooltipBack}>
                    <Button onClick={handleBackButtonCallback}>
                        <i className='glyphicon glyphicon-step-backward' />
                        {'뒤로'}
                    </Button>
                </OverlayTrigger>
            </div>
            <div
                className='title-bar-left'
                style={{float: 'left', marginLeft: '10px'}}
            >
                <Alert bsStyle='warning'>
                    <p>{title}</p>
                </Alert>
            </div>
            <div className='title-bar-right' style={{float: 'right'}}>
                <OverlayTrigger placement='left' overlay={tooltipAdd}>
                    <Button onClick={handleAddButtonCallback}>{'Add'}</Button>
                </OverlayTrigger>
            </div>
        </div>
    );
}
