import React, {useCallback} from 'react';
import {Modal as RBModal} from 'react-bootstrap';
interface Props {
    show?: boolean;
    onEventCallback: () => void;
    children?: React.ReactNode;
}

export default function Modal({
    show = false,
    onEventCallback,
    children,
}: Props): React.ReactElement {
    const handleModalCallback = useCallback(() => {
        onEventCallback();
    }, [onEventCallback]);

    return (
        <RBModal
            // bsSize='large'
            // aria-labelledby='contained-modal-title-lg'
            dialogClassName='custom-modal'
            show={show}
            onHide={handleModalCallback}
        >
            {children}
        </RBModal>
    );
}
