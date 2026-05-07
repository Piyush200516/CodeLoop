import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Auth0Provider } from '@auth0/auth0-react';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import './index.css';

const AUTH0_DOMAIN = import.meta.env.VITE_AUTH0_DOMAIN;
const AUTH0_CLIENT_ID = import.meta.env.VITE_AUTH0_CLIENT_ID;

const hasAuth0Config = Boolean(AUTH0_DOMAIN) && Boolean(AUTH0_CLIENT_ID);

if (!hasAuth0Config) {
    console.warn('[Auth0] Missing VITE_AUTH0_DOMAIN and/or VITE_AUTH0_CLIENT_ID. Auth0Provider will be skipped to avoid redirect to undefined/authorize.');
    if (!AUTH0_DOMAIN) console.warn('[Auth0] VITE_AUTH0_DOMAIN is missing');
    if (!AUTH0_CLIENT_ID) console.warn('[Auth0] VITE_AUTH0_CLIENT_ID is missing');
}

const toasterEl = (
    <Toaster
        position="top-right"
        toastOptions={{
            style: {
                background: '#1e293b',
                color: '#f1f5f9',
                border: '1px solid #334155',
                borderRadius: '12px',
                fontSize: '14px',
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#1e293b' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#1e293b' } },
        }}
    />
);


const appTree = (
    <AuthProvider>
        <ThemeProvider>
            <App />
            {toasterEl}
        </ThemeProvider>
    </AuthProvider>
);

const rootTree = (
    <React.StrictMode>
        <BrowserRouter>
            {hasAuth0Config ? (
                <Auth0Provider
                    domain={AUTH0_DOMAIN}
                    clientId={AUTH0_CLIENT_ID}
                    authorizationParams={{
                        redirect_uri: window.location.origin,
                    }}
                >
                    {appTree}
                </Auth0Provider>
            ) : (
                appTree
            )}
        </BrowserRouter>
    </React.StrictMode>
);

ReactDOM.createRoot(document.getElementById('root')).render(rootTree);



