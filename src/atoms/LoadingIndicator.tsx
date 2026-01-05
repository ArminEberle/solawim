import 'src/atoms/LoadingIndicator.css';

import type { CSSProperties } from 'react';

export const LoadingIndicator = (options: {
    style?: CSSProperties;
}) => (
    <div
        className="loader-wrapper"
        style={options.style}
    >
        <div className="loader-text">
            <div>Lade</div>
            <div>Daten</div>
        </div>
        <div className="loader"></div>;
    </div>
);
