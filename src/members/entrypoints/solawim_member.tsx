import 'src/css/index.css';
import React from 'react';
import { MemberSelfManagementPage } from 'src/members/pages/MemberSelfManagementPage';
import { createRoot } from 'react-dom/client';

window.addEventListener('load', () => {
    const root = createRoot(document.getElementById('solawim_membership') as Element);
    root.render(<MemberSelfManagementPage />);
});