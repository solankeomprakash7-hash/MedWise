import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import EcgApp from './EcgApp';
import '../index.css';

createRoot(document.getElementById('root')!).render(<StrictMode><EcgApp /></StrictMode>);

if ('serviceWorker' in navigator && import.meta.env.PROD) addEventListener('load', () => navigator.serviceWorker.register('/ecg-sw.js', { scope: '/ecg' }).catch(() => {}));
