import { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/shared/utils';
import { Button } from './button';

interface ToastProps {
    message: string;
    type: 'success' | 'error' | 'info';
    duration?: number;
    onClose: () => void;
}

export function Toast({ message, type, duration = 5000, onClose }: ToastProps) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300); // Wait for fade out animation
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'error':
                return <AlertCircle className="h-5 w-5 text-red-500" />;
            case 'info':
                return <Info className="h-5 w-5 text-blue-500" />;
            default:
                return <Info className="h-5 w-5 text-blue-500" />;
        }
    };

    const getBackgroundColor = () => {
        switch (type) {
            case 'success':
                return 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800';
            case 'error':
                return 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800';
            case 'info':
                return 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800';
            default:
                return 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800';
        }
    };

    return (
        <div
            className={cn(
                'fixed top-4 right-4 z-50 flex items-center gap-3 rounded-lg border p-4 shadow-lg transition-all duration-300',
                getBackgroundColor(),
                isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
            )}
        >
            {getIcon()}
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {message}
            </span>
            <Button
                onClick={() => {
                    setIsVisible(false);
                    setTimeout(onClose, 300);
                }}
                className="ml-auto rounded-md p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                aria-label="Close notification"
            >
                <X className="h-4 w-4" />
            </Button>
        </div>
    );
}

interface ToastContainerProps {
    toasts: Array<{
        id: string;
        message: string;
        type: 'success' | 'error' | 'info';
        duration?: number;
    }>;
    onRemoveToast: (id: string) => void;
}

export function ToastContainer({ toasts, onRemoveToast }: ToastContainerProps) {
    return (
        <div className="fixed top-4 right-4 z-50 space-y-2">
            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                    duration={toast.duration}
                    onClose={() => onRemoveToast(toast.id)}
                />
            ))}
        </div>
    );
}
