import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// The font files are bundled with the app (no font website), so it works offline.
import '@fontsource/atkinson-hyperlegible/400.css';
import '@fontsource/atkinson-hyperlegible/700.css';
import '@fontsource-variable/source-serif-4/opsz.css'; // display serif; optical size follows font size
import './tailwind.css';
import './styles.css';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
