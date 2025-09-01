import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Auth0Provider } from '@auth0/auth0-react';
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import './index.css';
import App from './App/App.tsx';
import theme from './theme';

// Get Auth0 configuration from runtime environment variables
const getAuth0Config = () => {
  const requiredEnvVars = [
    'VITE_AUTH0_DOMAIN',
    'VITE_AUTH0_CLIENT_ID',
    'VITE_AUTH0_AUDIENCE',
  ];

  for (const envVar of requiredEnvVars) {
    if (!import.meta.env[envVar]) {
      throw new Error(`Missing environment variable: ${envVar}`);
    }
  }

  return {
    domain: import.meta.env.VITE_AUTH0_DOMAIN,
    clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
    audience: import.meta.env.VITE_AUTH0_AUDIENCE,
  };
};

const auth0Config = getAuth0Config();

const root = createRoot(document.getElementById('root')!);

// frontend/src/main.tsx

// ... other code ...

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