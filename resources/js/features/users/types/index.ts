export interface TenantRole {
    name: string;
    display_name: string;
    description?: string;
}

export interface Invitation {
    id: string;
    tenant_id: string;
    email: string;
    role: string;
    token: string;
    status: 'pending' | 'accepted' | 'expired';
    expires_at: string;
    created_at: string;
    tenant: {
        id: string;
        name: string;
    };
}

// New interface for unified display
export interface UserCard {
    id: string;
    type: 'user' | 'invitation';
    email: string;
    role: string;
    status?: 'pending' | 'accepted' | 'expired';
    name?: string;
    avatar?: string;
    created_at: string;
    expires_at?: string;
    tenant_id: string;
    // For users
    user_id?: number;
    // For invitations
    invitation_id?: string;
    token?: string;
}

export interface InvitationFormData extends Record<string, string> {
    email: string;
    role: string;
}

export interface Tenant {
    id: string;
    name: string;
}

export interface TenantUserInfo {
    name: string;
    email: string;
    role: string;
}

export interface TenantPermissions {
    can_grant: boolean;
    can_revoke: boolean;
    can_manage_owner: boolean;
    can_manage_users: boolean;
    can_manage_roles: boolean;
    can_view_analytics: boolean;
    can_manage_settings: boolean;
    can_invite_users: boolean;
    can_remove_users: boolean;
    can_manage_permissions: boolean;
}

export interface UsersIndexPageProps {
    userCards: UserCard[];
    availableRoles: TenantRole[];
}

export interface UsersCreatePageProps {
    tenant: Tenant;
    availableRoles: TenantRole[];
    user: TenantUserInfo;
    permissions: TenantPermissions;
}

export interface AcceptInvitationPageProps {
    invitation: Invitation;
}

export interface InvitationAcceptedPageProps {
    tenant: {
        id: string;
        name: string;
    };
    redirectUrl: string;
}
