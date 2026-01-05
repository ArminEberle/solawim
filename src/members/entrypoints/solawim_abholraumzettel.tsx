import 'src/css/index.css';
import { createRoot } from 'react-dom/client';
import { AbholraumZettel } from 'src/members/pages/abholraumzettel/AbholraumZettel';

window.addEventListener('load', () => {
    const root = createRoot(document.getElementById('solawim_abholraumzettel') as Element);
    root.render(<AbholraumZettel />);
});
