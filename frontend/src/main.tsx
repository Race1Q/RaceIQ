import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Auth0Provider } from '@auth0/auth0-react';
import './index.css'
import App from './App.tsx'
const root = createRoot(document.getElementById('root')!);

root.render(
<Auth0Provider
    domain="dev-6mvzvr3totwc6rkd.us.auth0.com"
    clientId="nM3L0iuU12uOqSfucxxThUZFtt8xbfGP"
    authorizationParams={{
      redirect_uri: window.location.origin
    }}
  >
    <App />
  </Auth0Provider>,
);
