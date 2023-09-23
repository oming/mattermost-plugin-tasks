import React, {useCallback, useMemo} from 'react';
import {DropdownButton, MenuItem} from 'react-bootstrap';
interface Props {
    jobId: string;
    onEventCallback: (jobId: string, value: string) => void;
}

export default function DetailDropdownMenu({
    jobId,
    onEventCallback,
}: Props): React.ReactElement {
    const handleSelectCallback = useCallback(
        (eventKey: any) => {
            onEventCallback(jobId, eventKey);
        },
        [onEventCallback, jobId],
    );

    const title = useMemo(
        () => (
            <i
                className=' glyphicon glyphicon-option-horizontal'
                aria-hidden={true}
            />
        ),
        [],
    );
    return (
        <DropdownButton
            title={title}
            bsSize='small'
            noCaret={true}
            pullRight={true}
            onSelect={handleSelectCallback}
            id={`dropdown-no-caret-${jobId}`}
        >
            <MenuItem eventKey='modify'>{'Modify'}</MenuItem>
            <MenuItem divider={true} />
            <MenuItem eventKey='delete'>{'Delete'}</MenuItem>
        </DropdownButton>
    );
}
