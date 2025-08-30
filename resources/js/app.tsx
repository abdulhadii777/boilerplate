import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './shared/hooks/use-appearance';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => title ? `${title} - ${appName}` : appName,
    resolve: (name) => {
        // Handle feature-based page resolution
        if (name.includes('/')) {
            // For paths like 'dashboard/welcome', look in features/dashboard/pages/welcome.tsx
            const [feature, page] = name.split('/');
            return resolvePageComponent(`./features/${feature}/pages/${page}.tsx`, import.meta.glob('./features/**/pages/*.tsx'));
        }
        // For simple names like 'dashboard', look in features/dashboard/pages/index.tsx
        return resolvePageComponent(`./features/${name}/pages/index.tsx`, import.meta.glob('./features/**/pages/*.tsx'));
    },
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
