import React from 'react';
import {Modal as RBModal} from 'react-bootstrap';
interface Props {
    title: string;
}

export default function Header({title = ''}: Props): React.ReactElement {
    return (
        <RBModal.Header closeButton={true}>
            <RBModal.Title>{title}</RBModal.Title>
        </RBModal.Header>
    );
}
