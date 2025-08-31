import { usePage } from '@inertiajs/react';

export interface TenantRole {
    id: number;
    name: string;
    display_name: string;
    description?: string;
    guard_name: string;
}

export interface PagePropsWithRoles {
    availableRoles: TenantRole[];
    [key: string]: unknown;
}

/**
 * Hook to get available roles from the current page props
 */
export function useAvailableRoles(): TenantRole[] {
    const { props } = usePage<PagePropsWithRoles>();
    return props.availableRoles || [];
}

/**
 * Hook to check if a user has a specific role
 */
export function useRoleCheck(userRole: string) {
    const availableRoles = useAvailableRoles();
    
    return {
        /**
         * Check if user has a specific role
         */
        hasRole: (roleName: string): boolean => {
            return userRole === roleName;
        },
        
        /**
         * Check if user has any of the specified roles
         */
        hasAnyRole: (roleNames: string[]): boolean => {
            return roleNames.includes(userRole);
        },
        
        /**
         * Check if user has admin-level access
         * Works with any role names you define in the database
         */
        hasAdminAccess: (): boolean => {
            // You can customize these role names in your database
            const adminRoleNames = ['owner', 'admin', 'administrator', 'super_admin'];
            return adminRoleNames.includes(userRole);
        },
        
        /**
         * Check if user has management access
         * Works with any role names you define in the database
         */
        hasManagementAccess: (): boolean => {
            // You can customize these role names in your database
            const managementRoleNames = ['owner', 'admin', 'administrator', 'super_admin', 'manager', 'supervisor'];
            return managementRoleNames.includes(userRole);
        },
        
        /**
         * Check if user has elevated privileges
         * Works with any role names you define in the database
         */
        hasElevatedPrivileges: (): boolean => {
            // You can customize these role names in your database
            const elevatedRoleNames = ['owner', 'super_admin', 'system_admin'];
            return elevatedRoleNames.includes(userRole);
        },
        
        /**
         * Get role display name by role name
         */
        getRoleDisplayName: (roleName: string): string => {
            const role = availableRoles.find(r => r.name === roleName);
            return role?.display_name || roleName;
        },
        
        /**
         * Get all available role names
         */
        getAvailableRoleNames: (): string[] => {
            return availableRoles.map(r => r.name);
        },
        
        /**
         * Check if a role exists in the available roles
         */
        isRoleAvailable: (roleName: string): boolean => {
            return availableRoles.some(r => r.name === roleName);
        },
        
        /**
         * Get role by name
         */
        getRoleByName: (roleName: string): TenantRole | undefined => {
            return availableRoles.find(r => r.name === roleName);
        }
    };
}

/**
 * Hook to get current user's role information
 */
export function useCurrentUserRole() {
    const { props } = usePage<{ user: { role: string } }>();
    const userRole = props.user?.role || '';
    
    return {
        userRole,
        ...useRoleCheck(userRole)
    };
}
