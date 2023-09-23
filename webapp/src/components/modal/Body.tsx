import React from 'react';
import {Modal as RBModal} from 'react-bootstrap';
interface Props {
    children?: React.ReactNode;
}

export default function Body({children}: Props): React.ReactElement {
    return <RBModal.Body>{children}</RBModal.Body>;
}
