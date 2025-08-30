import { useCallback } from 'react';
import { router } from '@inertiajs/react';
import { NewRole } from '../types';

export function useRoleManagement() {
    const refreshRoles = useCallback(() => {
        router.reload({ only: ['availableRoles'] });
    }, []);

    const handleRoleCreated = useCallback((role: NewRole, addToast: (message: string, type: 'success' | 'error' | 'info') => void) => {
        addToast(`Role "${role.display_name}" created successfully!`, 'success');
        refreshRoles();
    }, [refreshRoles]);

    const handleRoleError = useCallback((message: string, addToast: (message: string, type: 'success' | 'error' | 'info') => void) => {
        addToast(message, 'error');
    }, []);

    return {
        refreshRoles,
        handleRoleCreated,
        handleRoleError,
    };
}
