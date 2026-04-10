import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './shared/styles/global.css'

// MSW(Mock Service Worker) 초기화
async function enableMocking() {
  const isMockEnabled = localStorage.getItem('VITE_ENABLE_MOCKS') === 'true';
  if (!isMockEnabled) {
    return;
  }
  
  const { worker } = await import('./mocks/browser');
  return worker.start({
    onUnhandledRequest: 'bypass',
  });
}

enableMocking().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
});
