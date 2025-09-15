export interface User {
    id: number;
    name: string;
    email: string;
    is_admin: boolean;
    is_disabled: boolean;
    status?: string;
    avatar?: string;
    email_verified_at?: string | null;
    created_at: string;
    updated_at: string;
    role?: {
        id: number;
        name: string;
    } | null;
    roles?: Array<{
        id: number;
        name: string;
        description?: string;
        is_system?: boolean;
    }>;
}

export interface UserCollection {
    data: User[];
    meta: {
        total: number;
        count: number;
        per_page: number;
        current_page: number;
        total_pages: number;
    };
}

export interface SimpleUser {
    id: number;
    name: string;
    email: string;
}
