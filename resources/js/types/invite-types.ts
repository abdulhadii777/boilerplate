export interface Invite {
    id: number;
    email: string;
    resent_count: number;
    accepted_at?: string | null;
    expires_at?: string | null;
    created_at: string;
    updated_at: string;
    status?: string;
    can_resend?: boolean;
    can_cancel?: boolean;
    role?: {
        id: number;
        name: string;
    } | null;
}

export interface InviteCollection {
    data: Invite[];
    meta: {
        total: number;
        count: number;
        per_page: number;
        current_page: number;
        total_pages: number;
    };
}
