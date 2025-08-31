import { usePermissions as usePermissionsFromPage, useCurrentUser, useTenant } from '../utils/permissions';
import { hasPermission, hasAnyPermission, hasAllPermissions, hasRole, hasAnyRole, hasAdminAccess, hasManagementAccess } from '../utils/permissions';
import type { TenantPermissions } from '../utils/permissions';

/**
 * Simplified hook for permission checking - now uses Inertia shared props
 */
export function usePermissions() {
    const permissions = usePermissionsFromPage();
    const currentUser = useCurrentUser();
    const tenant = useTenant();

    return {
        // Permission data
        permissions,
        currentUser,
        tenant,
        
        // Simple permission checking function
        can: (permission: keyof TenantPermissions) => hasPermission(permissions, permission),
        canAny: (permissionKeys: (keyof TenantPermissions)[]) => hasAnyPermission(permissions, permissionKeys),
        canAll: (permissionKeys: (keyof TenantPermissions)[]) => hasAllPermissions(permissions, permissionKeys),
        
        // Role checking functions
        hasRole: (role: string) => hasRole(currentUser.role, role),
        hasAnyRole: (roles: string[]) => hasAnyRole(currentUser.role, roles),
        hasAdminAccess: () => hasAdminAccess(currentUser.role),
        hasManagementAccess: () => hasManagementAccess(currentUser.role),
    };
}

/**
 * Hook for checking specific permissions
 */
export function usePermission(permission: keyof TenantPermissions): boolean {
    const permissionsData = usePermissionsFromPage();
    return hasPermission(permissionsData, permission);
}

/**
 * Hook for checking multiple permissions
 */
export function usePermissionsCheck(permissionKeys: (keyof TenantPermissions)[]): {
    canAny: boolean;
    canAll: boolean;
} {
    const permissionsData = usePermissionsFromPage();
    return {
        canAny: hasAnyPermission(permissionsData, permissionKeys),
        canAll: hasAllPermissions(permissionsData, permissionKeys),
    };
}

/**
 * Hook for role-based access control
 */
export function useRoleAccess(): {
    isOwner: boolean;
    isAdmin: boolean;
    isManager: boolean;
    isMember: boolean;
    isViewer: boolean;
    hasAdminAccess: boolean;
    hasManagementAccess: boolean;
} {
    const user = useCurrentUser();
    const userRole = user.role;
    
    return {
        isOwner: userRole === 'owner',
        isAdmin: userRole === 'admin',
        isManager: userRole === 'manager',
        isMember: userRole === 'member',
        isViewer: userRole === 'viewer',
        hasAdminAccess: hasAdminAccess(userRole),
        hasManagementAccess: hasManagementAccess(userRole),
    };
}
