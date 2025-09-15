export interface Permission {
    id: number;
    name: string;
    guard_name: string;
}

export interface Role {
    id: number;
    name: string;
    description?: string;
    is_system?: boolean;
    permissions?: Permission[];
    permissions_count?: number;
    users_count?: number;
    created_at: string;
    updated_at?: string;
}

export interface RoleCollection {
    data: Role[];
    meta: {
        total: number;
        count: number;
        per_page: number;
        current_page: number;
        total_pages: number;
    };
}

export interface SimpleRole {
    id: number;
    name: string;
}

export interface PermissionCollection {
    data: Permission[];
    meta: {
        total: number;
        count: number;
        per_page: number;
        current_page: number;
        total_pages: number;
    };
}
