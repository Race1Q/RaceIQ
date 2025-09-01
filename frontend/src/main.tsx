import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Auth0Provider } from '@auth0/auth0-react';
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import './index.css';
import App from './App/App.tsx';
import theme from './theme';

const root = createRoot(document.getElementById('root')!);

// frontend/src/main.tsx

// ... other code ...

root.render(
  <>
    <ColorModeScript initialColorMode={theme.config.initialColorMode} />
    <Auth0Provider
      domain={import.meta.env.VITE_AUTH0_DOMAIN!}
      clientId={import.meta.env.VITE_AUTH0_CLIENT_ID!}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        // 1. Added 'read:drivers' back to the scope
        scope: "openid profile email read:drivers read:standings read:constructors read:races read:race-results" 
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