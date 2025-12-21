import type { ReactElement } from 'react';
import { createRoot } from 'react-dom/client';
import { Button } from 'src/atoms/Button';
import 'src/css/alert-with-backdrop.css';

export type AlertWithBackdropProps = {
    text: string;
    onClose: () => void;
};

export const AlertWithBackdrop = (props: AlertWithBackdropProps): ReactElement => {
    return (
        <>
            <div
                className="alert-with-backdrop-backdrop"
                onClick={props.onClose}
            ></div>
            <p className="alert red alert-with-backdrop-alert d-flex flex-column">
                <div className="mb-3">{props.text}</div>
                <Button onClick={props.onClose}>OK</Button>
            </p>
        </>
    );
};

export const showAlertWithBackdrop = (text: string) => {
    const rootNode = document.createElement('div');
    const bodyNode = document.getElementsByTagName('body')[0];
    if (!bodyNode) {
        throw new Error('Could not find body');
    }
    bodyNode.appendChild(rootNode);
    const root = createRoot(rootNode);
    return new Promise<void>(resolve => {
        const callback = () => {
            root.unmount();
            rootNode.remove();
            resolve();
        };
        root.render(
            <AlertWithBackdrop
                onClose={callback}
                text={text}
            />,
        );
    });
};
