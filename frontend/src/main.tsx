import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Auth0Provider } from '@auth0/auth0-react';
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import './index.css';
import App from './App/App.tsx';
import theme from './theme';

// Get Auth0 configuration from runtime environment variables
const getAuth0Config = () => {
  // For local development, use import.meta.env
  if (import.meta.env.VITE_AUTH0_DOMAIN && import.meta.env.VITE_AUTH0_CLIENT_ID) {
    return {
      domain: import.meta.env.VITE_AUTH0_DOMAIN,
      clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
      audience: import.meta.env.VITE_AUTH0_AUDIENCE
    };
  }
  
  // For Azure Static Web Apps, use window variables
  const domain = (window as any).VITE_AUTH0_DOMAIN;
  const clientId = (window as any).VITE_AUTH0_CLIENT_ID;
  const audience = (window as any).VITE_AUTH0_AUDIENCE;
  
  if (!domain || !clientId) {
    throw new Error('Auth0 configuration is required. Check environment variables.');
  }
  
  return { domain, clientId, audience };
};

const auth0Config = getAuth0Config();

const root = createRoot(document.getElementById('root')!);

root.render(
  <>
    <ColorModeScript initialColorMode={theme.config.initialColorMode} />
    <Auth0Provider
      domain={auth0Config.domain}
      clientId={auth0Config.clientId}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: auth0Config.audience,
        // 1. Added 'read:drivers' back to the scope
        scope: 'openid profile email read:drivers' 
      }}
      // 2. Added the two props for Refresh Token Rotation
      useRefreshTokens={true}
      cacheLocation="localstorage"
    >
      <ChakraProvider theme={theme}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ChakraProvider>
    </Auth0Provider>
  </>
);