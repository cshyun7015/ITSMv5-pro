# MSW (Mock Service Worker) Skill

This skill provides a standardized way to mock API responses in the ITSMv5-pro frontend project. MSW intercepts requests at the network level, allowing for seamless switching between mock and real data.

## Installation & Setup

1.  **Install Package**:
    ```bash
    cd frontend
    npm install msw --save-dev
    ```

2.  **Initialize Service Worker**:
    ```bash
    npx msw init public/ --save
    ```

## Project Structure

- `frontend/src/mocks/handlers.ts`: Define API interceptors and mock data logic.
- `frontend/src/mocks/browser.ts`: Setup for browser-side mocking.
- `frontend/src/mocks/server.ts`: Setup for Node-side mocking (e.g., Vitest).

## Usage - Defining Handlers

Use `http` from `msw` to define headers.

```typescript
import { http, HttpResponse, delay } from 'msw';

export const handlers = [
  http.get('/api/v1/request', async () => {
    // Check scenario from sessionStorage
    const scenario = sessionStorage.getItem('mock-scenario') || 'default';
    
    if (scenario === 'error') {
      return new HttpResponse(null, { status: 500 });
    }
    
    if (scenario === 'empty') {
      return HttpResponse.json([]);
    }
    
    return HttpResponse.json([
      { id: 1, title: 'Mock Request', status: 'NEW' }
    ]);
  }),
];
```

## Usage - Starting Worker

In `frontend/src/main.tsx`:

```typescript
async function enableMocking() {
  if (import.meta.env.VITE_ENABLE_MOCKS !== 'true') return;
  
  const { worker } = await import('./mocks/browser');
  return worker.start();
}

enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(...);
});
```

## Best Practices

> [!TIP]
> **Scenario Switching**: Use `sessionStorage` or a query parameter to persist mock scenarios across page reloads.

> [!WARNING]
> **Real vs. Mock**: Always ensure MSW is only enabled in development or specific test environments. Never ship MSW to production unless intended for a demo environment.

### 4. Verification Guidelines
- **Monitor Runtime Errors**: When using the browser subagent, always run `capture_browser_console_logs` and `browser_list_network_requests`.
- **Validation**:
  - Check if `[MSW] Mocking enabled.` appears in the console.
  - Verify that requests to `/api/v1/...` are being intercepted (look for 'mocked' status or response override).
  - Ensure no unexpected `404`, `500`, or `CORS` errors appear in the network tab unless intentionally testing those scenarios.
