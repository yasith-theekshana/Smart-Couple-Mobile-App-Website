import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import MobileAppTest from './pages/test/MobileAppTest';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MobileAppTest />
  </StrictMode>,
);
