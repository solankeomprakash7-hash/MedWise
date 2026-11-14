import { StrictMode, Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

// "/" is the public landing page; the clinical app lives under "/app".
const isApp = window.location.pathname.startsWith('/app');
const Page = isApp ? lazy(() => import('./App.tsx')) : lazy(() => import('./landing/Landing.tsx'));

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Suspense fallback={null}>
      <Page />
    </Suspense>
  </StrictMode>,
);
