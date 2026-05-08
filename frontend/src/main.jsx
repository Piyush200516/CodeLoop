import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './index.css';


const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

if (!GOOGLE_CLIENT_ID) {
    console.error('[Google OAuth] Missing VITE_GOOGLE_CLIENT_ID. Check Vercel env vars and redeploy.');
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
<GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
                {appTree}
            </GoogleOAuthProvider>
        </BrowserRouter>
    </React.StrictMode>
);


ReactDOM.createRoot(document.getElementById('root')).render(rootTree);



