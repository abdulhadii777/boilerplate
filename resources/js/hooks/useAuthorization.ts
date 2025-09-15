import { type PageProps } from '@/types';
import { usePage } from '@inertiajs/react';

export function useAuthorization() {
    const { auth } = usePage<PageProps>().props;
    const hasPermission = (permission: string): boolean => {
        return auth.permissions?.includes(permission) || false;
    };

    const hasAnyPermission = (permissions: string[]): boolean => {
        return permissions.some((permission) => auth.permissions?.includes(permission)) || false;
    };

    const hasAllPermissions = (permissions: string[]): boolean => {
        return permissions.every((permission) => auth.permissions?.includes(permission)) || false;
    };

    const hasRole = (role: string): boolean => {
        return auth.roles?.includes(role) || false;
    };

    const hasAnyRole = (roles: string[]): boolean => {
        return auth.roles?.some((role) => roles.includes(role)) || false;
    };

    const hasAllRoles = (roles: string[]): boolean => {
        return auth.roles?.every((role) => roles.includes(role)) || false;
    };

    const can = (action: string): boolean => {
        // This would integrate with your backend policies
        // For now, we'll use the basic permission checks
        return hasPermission(action);
    };

    return {
        user: auth.user,
        permissions: auth.permissions,
        roles: auth.roles,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        hasRole,
        hasAnyRole,
        hasAllRoles,
        can,
    };
}
