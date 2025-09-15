export interface Notification {
    id: string;
    type: string;
    notifiable_type: string;
    notifiable_id: number;
    data: {
        title: string;
        message: string;
        type: string;
        device_name?: string;
        timestamp?: string;
        [key: string]: unknown;
    };
    read_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface NotificationCollection {
    data: Notification[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
    first_page_url: string;
    from: number;
    last_page_url: string;
    next_page_url: string | null;
    path: string;
    prev_page_url: string | null;
    to: number;
}

export interface RecentNotification {
    id: number;
    type: string;
    title: string;
    message: string;
    data: Record<string, unknown>;
    read_at: string | null;
    created_at: string;
}

export interface NotificationPagination {
    hasMore: boolean;
    total: number;
    perPage: number;
}
