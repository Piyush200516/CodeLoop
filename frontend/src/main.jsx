import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import './index.css';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '398076341480-s8o423fhgdnncb3fjdgea4vcl48kc9ke.apps.googleusercontent.com'; // Placeholder OR from env

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
                <AuthProvider>
                    <ThemeProvider>
                        <App />
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
                    </ThemeProvider>
                </AuthProvider>
            </GoogleOAuthProvider>
        </BrowserRouter>
    </React.StrictMode>
);
