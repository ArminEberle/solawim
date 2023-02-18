import 'src/css/index.css';

import React from 'react';
import ReactDOM from 'react-dom/client';
import { VereinsverwaltungPage } from 'src/members/pages/VereinsverwaltungPage';
import { has } from 'src/utils/has';
/**
 * Hello 2
 */
const targetElement = document.getElementById('solawim_manage') as Element;
if (!has(targetElement)) {
    alert('Die Seite scheint kaputt zu sein.');
}
const root = ReactDOM.createRoot(targetElement);
root.render(<VereinsverwaltungPage />);