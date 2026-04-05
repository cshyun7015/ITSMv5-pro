import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './tracing.js';
import App from './App.tsx'

async function enableMocking() {
  // Check both environment variable and a sessionStorage override
  const mocksEnabled = import.meta.env.VITE_ENABLE_MOCKS === 'true' || sessionStorage.getItem('mock-enabled') === 'true';
  if (!mocksEnabled) return;

  const { worker } = await import('./mocks/browser');
  
  // `worker.start()` returns a Promise that resolves
  // once the Service Worker is up and ready to intercept requests.
  return worker.start({
    onUnhandledRequest: 'bypass', // Don't warn for real assets
  });
}

enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
});
