// import '/src/atoms/LoadingIndicator.css';
import './LoadingIndicator.css';

import React from 'react';

export const LoadingIndicator = (options: {
    style?: React.CSSProperties;
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
