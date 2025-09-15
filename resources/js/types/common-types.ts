import { type LucideIcon } from 'lucide-react';

export interface BreadcrumbItem {
    title: string;
    name?: string;
}

export interface NavItem {
    title: string;
    name: string;
    icon?: LucideIcon | null;
    current?: boolean;
}

export interface PaginationMeta {
    total: number;
    count: number;
    per_page: number;
    current_page: number;
    total_pages: number;
}

export interface PaginationLinks {
    url: string | null;
    label: string;
    active: boolean;
}

export interface FlashMessage {
    success?: string;
    error?: string;
}

export interface AuthUser {
    user: any | null;
    permissions: string[];
    roles: string[];
}
