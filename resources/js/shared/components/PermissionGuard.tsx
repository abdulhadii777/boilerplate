import React from 'react';
import { usePermissions } from '../hooks/usePermissions';
import type { TenantPermissions } from '../utils/permissions';

interface PermissionGuardProps {
    children: React.ReactNode;
    permission?: keyof TenantPermissions;
    permissions?: (keyof TenantPermissions)[];
    requireAll?: boolean;
    fallback?: React.ReactNode;
    showIf?: boolean;
}

/**
 * Higher-order component for permission-based conditional rendering
 */
export function PermissionGuard({
    children,
    permission,
    permissions,
    requireAll = false,
    fallback = null,
    showIf,
}: PermissionGuardProps) {
    const { can, canAny, canAll } = usePermissions();

    // If showIf is explicitly provided, use that
    if (showIf !== undefined) {
        return showIf ? <>{children}</> : <>{fallback}</>;
    }

    // Check single permission
    if (permission) {
        return can(permission) ? <>{children}</> : <>{fallback}</>;
    }

    // Check multiple permissions
    if (permissions && permissions.length > 0) {
        const hasAccess = requireAll ? canAll(permissions) : canAny(permissions);
        return hasAccess ? <>{children}</> : <>{fallback}</>;
    }

    // If no permission check specified, show children
    return <>{children}</>;
}

// Removed specialized permission guard components to simplify usage.
// Use the generic PermissionGuard component directly like:
// <PermissionGuard permission="can_manage_users">{children}</PermissionGuard>
