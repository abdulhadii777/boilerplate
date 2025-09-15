export interface ActivityLog {
    id: number;
    feature: string;
    action: string;
    details: string;
    performed_by: number | null;
    performed_at: string;
    created_at: string;
    updated_at: string;
    performer?: {
        id: number;
        name: string;
        email: string;
    } | null;
}

export interface ActivityLogCollection {
    data: ActivityLog[];
    meta: {
        total: number;
        count: number;
        per_page: number;
        current_page: number;
        total_pages: number;
    };
}

export interface ActivityLogFilters {
    feature?: string;
    action?: string;
    performed_by?: number;
    date_from?: string;
    date_to?: string;
    search?: string;
    per_page?: number;
    [key: string]: string | number | undefined;
}
