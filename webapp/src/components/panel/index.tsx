import React from 'react';
import {Panel as RBPanel} from 'react-bootstrap';
interface Props {
    headerTitle: string;
    children?: React.ReactNode;
}

export default function Panel({
    headerTitle,
    children,
}: Props): React.ReactElement {
    return (
        <RBPanel id='collapsible-panel-example-1'>
            <RBPanel.Heading>{headerTitle}</RBPanel.Heading>
            <RBPanel.Body>{children}</RBPanel.Body>
        </RBPanel>
    );
}
