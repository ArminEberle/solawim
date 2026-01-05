import 'src/css/index.css';
import { createRoot } from 'react-dom/client';
import { VereinsverwaltungPage } from 'src/members/pages/management/VereinsverwaltungPage';
import { has } from 'src/utils/has';

window.addEventListener('load', () => {
    const targetElement = document.getElementById('solawim_manage') as Element;
    if (!has(targetElement)) {
        alert('Die Seite scheint kaputt zu sein.');
    }
    const root = createRoot(targetElement);
    root.render(<VereinsverwaltungPage />);
});
