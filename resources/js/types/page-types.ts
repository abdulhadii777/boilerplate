import type { ActivityLog, ActivityLogFilters } from './activity-log-types';
import type { AuthUser, FlashMessage, PaginationLinks } from './common-types';
import type { Invite } from './invite-types';
import type { NotificationCollection, NotificationPagination, RecentNotification } from './notification-types';
import type { Permission, Role } from './role-types';
import type { User } from './user-types';

export interface Business {
    id: string;
    name: string;
    is_current: boolean;
    is_favorite: boolean;
}

export interface CurrentBusiness {
    id: string;
    name: string;
}

export interface PageProps {
    auth: AuthUser;
    flash: FlashMessage;
    ziggy: Record<string, unknown>;
    sidebarOpen: boolean;
    roles?: Role[];
    permissions?: { [key: string]: Permission[] };
    totalUsers?: number;
    totalInvites?: number;
    businesses: Business[];
    currentBusiness: CurrentBusiness | null;
    csrf_token: string;
    [key: string]: unknown;
}

export interface MainPageProps extends PageProps {
    unreadCount: number;
    recentNotifications: RecentNotification[];
    notificationPagination: NotificationPagination;
}

export interface UsersPageProps extends PageProps {
    users: User[];
    invites: Invite[];
    roles: Role[];
    activeUsersCount: number;
    inactiveUsersCount: number;
    totalInvites: number;
}

export interface ActivityLogPageProps extends PageProps {
    logs: {
        data: ActivityLog[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: PaginationLinks[];
        first_page_url: string;
        from: number;
        last_page_url: string;
        next_page_url: string | null;
        path: string;
        prev_page_url: string | null;
        to: number;
    };
    filters: ActivityLogFilters;
    availableFeatures: string[];
    availableActions: string[];
    availableUsers?: Array<{ id: number; name: string; email: string }>;
}

export interface SharedData {
    unreadCount: number;
    notifications: NotificationCollection;
    [key: string]: unknown;
}
