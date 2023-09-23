import React, {useCallback, useMemo} from 'react';
import {DropdownButton, MenuItem} from 'react-bootstrap';
interface Props {
    taskId: string;
    onEventCallback: (taskId: string, value: string) => void;
}

export default function MainDropdownMenu({
    taskId,
    onEventCallback,
}: Props): React.ReactElement {
    const handleSelectCallback = useCallback(
        (eventKey: any) => {
            onEventCallback(taskId, eventKey);
        },
        [onEventCallback, taskId],
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
            id={`dropdown-no-caret-${taskId}`}
        >
            <MenuItem eventKey='modify'>{'Modify'}</MenuItem>
            <MenuItem divider={true} />
            <MenuItem eventKey='delete'>{'Delete'}</MenuItem>
        </DropdownButton>
    );
}
