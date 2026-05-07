import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import './index.css';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

if (!GOOGLE_CLIENT_ID) {
    // eslint-disable-next-line no-console
    console.warn('Missing VITE_GOOGLE_CLIENT_ID. Google login will be disabled.');
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

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            {GOOGLE_CLIENT_ID ? (
                <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
                    <AuthProvider>
                        <ThemeProvider>
                            <App />
                            {toasterEl}
                        </ThemeProvider>
                    </AuthProvider>
                </GoogleOAuthProvider>
            ) : (
                <AuthProvider>
                    <ThemeProvider>
                        <App />
                        {toasterEl}
                    </ThemeProvider>
                </AuthProvider>
            )}
        </BrowserRouter>
    </React.StrictMode>
);

