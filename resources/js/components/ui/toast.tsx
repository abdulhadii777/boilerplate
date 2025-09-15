import { Toaster } from 'sonner';

export function ToastProvider() {
    return (
        <Toaster
            position="top-right"
            toastOptions={{
                duration: 4000,
                style: {
                    background: 'var(--sidebar)',
                    color: 'var(--foreground)',
                    border: '1px solid var(--sidebar)',
                },
            }}
        />
    );
}
