import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { type SharedData } from '@/types';
import { router, usePage } from '@inertiajs/react';
import { Bell } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTenantRoute } from '@/utils/tenantRoute';
import { NotificationList } from './notification-list';

interface Notification {
    id: string; // Changed from number to string to match UUID format
    type: string;
    title: string;
    message: string;
    notification_type: string;
    device_name: string | null;
    timestamp: string | null;
    read_at: string | null;
    created_at: string;
}

interface NotificationData {
    title?: string;
    message?: string;
    type?: string;
    event_type?: string;
    device_name?: string;
    timestamp?: string;
    [key: string]: unknown;
}

interface NotificationBellProps {
    className?: string;
    unreadCount: number;
}

export function NotificationBell({ className, unreadCount }: NotificationBellProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [localNotifications, setLocalNotifications] = useState<Notification[]>([]);
    const [hasMore, setHasMore] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [loadingMore, setLoadingMore] = useState(false);
    const { notifications } = usePage<SharedData>().props;
    const tenantRoute = useTenantRoute();

    // Initialize notifications when component mounts
    useEffect(() => {
        if (notifications?.data) {
            // Transform the raw notification data to match our Notification interface
            const transformedNotifications: Notification[] = notifications.data.map((notification) => {
                // Handle both string and object data formats
                let notificationData: NotificationData = notification.data;
                if (typeof notificationData === 'string') {
                    try {
                        notificationData = JSON.parse(notificationData);
                    } catch {
                        console.warn('Failed to parse notification data:', notificationData);
                        notificationData = { title: 'Notification', message: 'You have a new notification', type: 'general' };
                    }
                }

                return {
                    id: notification.id,
                    type: notification.type,
                    title: notificationData?.title || 'Notification',
                    message: notificationData?.message || 'You have a new notification',
                    notification_type: notificationData?.type || notificationData?.event_type || 'general',
                    device_name: notificationData?.device_name || null,
                    timestamp: notificationData?.timestamp || null,
                    read_at: notification.read_at,
                    created_at: notification.created_at,
                };
            });

            setLocalNotifications(transformedNotifications);
            setCurrentPage(notifications.current_page);
            setHasMore(notifications.current_page < notifications.last_page);
        }
    }, [notifications]);

    const handleNotificationRead = (notificationId: string) => {
        // Update local state to mark notification as read
        setLocalNotifications((prev) =>
            prev.map((notification) => (notification.id === notificationId ? { ...notification, read_at: new Date().toISOString() } : notification)),
        );
    };

    const handleAllRead = () => {
        // Update local state to mark all notifications as read
        setLocalNotifications((prev) => prev.map((notification) => ({ ...notification, read_at: new Date().toISOString() })));
    };

    const loadMoreNotifications = async () => {
        if (!hasMore || loadingMore) {
            return;
        }

        try {
            setLoadingMore(true);
            const nextPage = currentPage + 1;

            await router.get(
                tenantRoute('notifications.index'),
                {
                    page: currentPage + 1,
                    per_page: 10,
                },
                {
                    preserveState: true,
                    preserveScroll: true,
                    onSuccess: (page) => {
                    // Merge new page data into state
                    const pageProps = page.props as Record<string, unknown>;
                    const newNotifications = (
                        pageProps.notifications as {
                            data: Array<{
                                id: string;
                                type: string;
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
                            }>;
                            last_page: number;
                        }
                    )?.data;

                    if (newNotifications && newNotifications.length > 0) {
                        // Transform the raw notification data to match our format
                        const transformedNotifications: Notification[] = newNotifications.map((notification) => {
                            // Handle both string and object data formats
                            let notificationData: NotificationData = notification.data;
                            if (typeof notificationData === 'string') {
                                try {
                                    notificationData = JSON.parse(notificationData);
                                } catch {
                                    console.warn('Failed to parse notification data:', notificationData);
                                    notificationData = { title: 'Notification', message: 'You have a new notification', type: 'general' };
                                }
                            }

                            return {
                                id: notification.id,
                                type: notification.type,
                                title: notificationData?.title || 'Notification',
                                message: notificationData?.message || 'You have a new notification',
                                notification_type: notificationData?.type || notificationData?.event_type || 'general',
                                device_name: notificationData?.device_name || null,
                                timestamp: notificationData?.timestamp || null,
                                read_at: notification.read_at,
                                created_at: notification.created_at,
                            };
                        });

                        setLocalNotifications((prev) => [...prev, ...transformedNotifications]);
                        setCurrentPage(nextPage);

                        // Check if there are more pages
                        const totalPages = (pageProps.notifications as { last_page: number })?.last_page || 1;
                        setHasMore(nextPage < totalPages);
                    } else {
                        setHasMore(false);
                    }
                },
                    onError: () => {
                        setHasMore(false);
                    },
                }
            );
        } catch {
            setHasMore(false);
        } finally {
            setLoadingMore(false);
        }
    };

    return (
        <div className="relative">
            <Button
                variant="ghost"
                size="icon"
                className={`relative text-muted-foreground hover:bg-muted hover:text-foreground ${className}`}
                aria-label="Notifications"
                onClick={() => setIsOpen(!isOpen)}
            >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <Badge
                        variant="destructive"
                        className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-0 bg-destructive p-0 text-xs text-destructive-foreground"
                    >
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </Badge>
                )}
            </Button>

            {isOpen && (
                <NotificationList
                    notifications={localNotifications}
                    onNotificationRead={handleNotificationRead}
                    onAllRead={handleAllRead}
                    onClose={() => setIsOpen(false)}
                    hasMore={hasMore}
                    onLoadMore={loadMoreNotifications}
                />
            )}
        </div>
    );
}
