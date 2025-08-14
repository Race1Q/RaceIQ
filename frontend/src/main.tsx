import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Auth0Provider } from '@auth0/auth0-react';
import './index.css';
import App from './App.tsx';

const root = createRoot(document.getElementById('root')!);

root.render(
  <Auth0Provider
    domain={import.meta.env.VITE_AUTH0_DOMAIN}
    clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
    authorizationParams={{
      redirect_uri: window.location.origin,
      audience: import.meta.env.VITE_AUTH0_AUDIENCE,   // your API identifier (e.g., https://raceiq.api)
      scope: 'openid profile email'                    // OIDC scopes; API permissions come via RBAC
    }}
    // Optional: persist tokens across reloads
    // cacheLocation="localstorage"
    // useRefreshTokens={true}
  >
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Auth0Provider>
);
