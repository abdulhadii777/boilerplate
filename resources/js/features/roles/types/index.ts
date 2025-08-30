export interface Role {
    name: string;
    display_name: string;
    description: string;
    permissions: string[];
    permission_count: number;
}

export interface Permission {
    name: string;
    display_name: string;
    description: string;
}

export interface NewRole {
    name: string;
    display_name: string;
    description: string;
    permissions: string[];
}

export interface Tenant {
    id: string;
    name: string;
}

export interface User {
    name: string;
    email: string;
    role: string;
}

export interface UserPermissions {
    can_grant: boolean;
    can_revoke: boolean;
    can_manage_owner: boolean;
    can_manage_users: boolean;
    can_manage_roles: boolean;
    can_view_analytics: boolean;
    can_manage_settings: boolean;
}

export interface RoleManagementPageProps {
    tenant: Tenant;
    user: User;
    availableRoles: Role[];
    availablePermissions: Permission[];
    permissions: UserPermissions;
}


