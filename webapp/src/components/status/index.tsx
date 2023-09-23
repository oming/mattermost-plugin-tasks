import React, {useCallback, useMemo} from 'react';
import {Label} from 'react-bootstrap';
interface Props {
    status: string;
    onEventCallback: () => void;
}

export default function Status({
    status,
    onEventCallback,
}: Props): React.ReactElement {
    const {style, title} = useMemo(() => {
        if (status === 'open') {
            return {style: 'default', title: 'OPEN'};
        }
        return {style: 'danger', title: 'DONE'};
    }, [status]);

    const handleToggle = useCallback(() => {
        onEventCallback();
    }, [onEventCallback]);

    return (
        <Label bsStyle={style} onClick={handleToggle}>
            {title}
        </Label>
    );
}
