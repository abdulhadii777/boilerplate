import { useState, useCallback } from 'react';

export interface Toast {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
    duration?: number;
}

export function useToast() {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((
        message: string, 
        type: 'success' | 'error' | 'info' = 'info', 
        duration = 5000
    ) => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts(prev => [...prev, { id, message, type, duration }]);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    const clearAllToasts = useCallback(() => {
        setToasts([]);
    }, []);

    return {
        toasts,
        addToast,
        removeToast,
        clearAllToasts,
    };
}
