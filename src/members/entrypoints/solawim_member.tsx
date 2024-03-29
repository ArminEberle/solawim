import 'src/css/index.css';

import React from 'react';
import ReactDOM from 'react-dom/client';
import { MemberSelfManagementPage } from 'src/members/pages/MemberSelfManagementPage';
window.addEventListener('load', () => {
    const root = ReactDOM.createRoot(document.getElementById('solawim_membership') as Element);
    root.render(<MemberSelfManagementPage />);
});