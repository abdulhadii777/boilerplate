import { usePage } from '@inertiajs/react';

export interface TenantPermissions {
    can_view_dashboard: boolean;
    can_view_analytics: boolean;
    can_manage_users: boolean;
    can_invite_users: boolean;
    can_remove_users: boolean;
    can_manage_roles: boolean;
    can_manage_permissions: boolean;
    can_manage_settings: boolean;
}

export interface TenantUserInfo {
    name: string;
    email: string;
    role: string;
}

export interface Tenant {
    id: string;
    name: string;
}

export interface PageProps {
    tenant: Tenant;
    user: TenantUserInfo;
    permissions: TenantPermissions;
    [key: string]: unknown; // Index signature for Inertia compatibility
}

/**
 * Get permissions from the current page props
 */
export function usePermissions(): TenantPermissions {
    const { props } = usePage<PageProps>();
    return props.permissions;
}

/**
 * Get tenant info from the current page props
 */
export function useTenant(): Tenant {
    const { props } = usePage<PageProps>();
    return props.tenant;
}

/**
 * Get current user info from the current page props
 */
export function useCurrentUser(): TenantUserInfo {
    const { props } = usePage<PageProps>();
    return props.user;
}

/**
 * Check if user has a specific permission
 */
export function hasPermission(permissions: TenantPermissions, permission: keyof TenantPermissions): boolean {
    return permissions[permission] === true;
}

/**
 * Check if user has any of the specified permissions
 */
export function hasAnyPermission(permissions: TenantPermissions, permissionKeys: (keyof TenantPermissions)[]): boolean {
    return permissionKeys.some(key => permissions[key] === true);
}

/**
 * Check if user has all of the specified permissions
 */
export function hasAllPermissions(permissions: TenantPermissions, permissionKeys: (keyof TenantPermissions)[]): boolean {
    return permissionKeys.every(key => permissions[key] === true);
}

/**
 * Permission constants for easy reference
 */
export const PERMISSIONS = {
    // Dashboard
    VIEW_DASHBOARD: 'can_view_dashboard',
    VIEW_ANALYTICS: 'can_view_analytics',
    
    // User Management
    MANAGE_USERS: 'can_manage_users',
    INVITE_USERS: 'can_invite_users',
    REMOVE_USERS: 'can_remove_users',
    
    // Role Management
    MANAGE_ROLES: 'can_manage_roles',
    
    // Permission Management
    MANAGE_PERMISSIONS: 'can_manage_permissions',
    
    // System Management
    MANAGE_SETTINGS: 'can_manage_settings',
} as const;

/**
 * Check if user has a specific role
 */
export function hasRole(userRole: string, role: string): boolean {
    return userRole === role;
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(userRole: string, roles: string[]): boolean {
    return roles.includes(userRole);
}

/**
 * Check if user has admin-level access
 * This function works with dynamic roles from the database
 * You can customize the admin role names in your database
 */
export function hasAdminAccess(userRole: string): boolean {
    // These are common admin role names, but they can be customized in the database
    const adminRoles = ['owner', 'admin', 'administrator', 'super_admin'];
    return hasAnyRole(userRole, adminRoles);
}

/**
 * Check if user has management access
 * This function works with dynamic roles from the database
 * You can customize the management role names in your database
 */
export function hasManagementAccess(userRole: string): boolean {
    // These are common management role names, but they can be customized in the database
    const managementRoles = ['owner', 'admin', 'administrator', 'super_admin', 'manager', 'supervisor'];
    return hasAnyRole(userRole, managementRoles);
}

/**
 * Check if user has elevated privileges
 * This function works with dynamic roles from the database
 * You can customize the elevated role names in your database
 */
export function hasElevatedPrivileges(userRole: string): boolean {
    // These are common elevated role names, but they can be customized in the database
    const elevatedRoles = ['owner', 'super_admin', 'system_admin'];
    return hasAnyRole(userRole, elevatedRoles);
}
