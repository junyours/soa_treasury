import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { useEffect } from 'react';
import { router } from '@inertiajs/react';

// Clear statement of account data when user logs out
const clearStatementDataOnLogout = () => {
    // Clear all statement of account related localStorage items
    localStorage.removeItem('statementOfAccountData');
    localStorage.removeItem('enviFee');
    localStorage.removeItem('preparedBy');
    localStorage.removeItem('certifiedCorrectBy');
};

const appName = import.meta.env.VITE_APP_NAME || 'TREASURY SOA';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        // Wrap App with logout detection
        const AppWithLogoutDetection = () => {
            useEffect(() => {
                // Monitor Inertia navigation events
                const handleStart = (event) => {
                    // Check if navigating to login page (indicating logout)
                    if (event.detail.visit.url.pathname.includes('login')) {
                        clearStatementDataOnLogout();
                    }
                };

                // Listen for Inertia navigation start events
                document.addEventListener('inertia:start', handleStart);

                return () => {
                    document.removeEventListener('inertia:start', handleStart);
                };
            }, []);

            return <App {...props} />;
        };

        root.render(<AppWithLogoutDetection />);
    },
    progress: {
        color: '#4B5563',
    },
});
