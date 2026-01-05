import 'src/css/index.css';
import { createRoot } from 'react-dom/client';
import { MemberSelfManagementPage } from 'src/members/pages/member/MemberSelfManagementPage';

window.addEventListener('load', () => {
    const root = createRoot(document.getElementById('solawim_membership') as Element);
    root.render(<MemberSelfManagementPage />);
});
