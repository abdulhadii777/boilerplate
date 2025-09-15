import { Button } from '@/components/ui/button';
import { router } from '@inertiajs/react';
import { formatDistanceToNow } from 'date-fns';
import { useTenantRoute } from '@/utils/tenantRoute';
import {
    Ban,
    Bell,
    Check,
    CheckCircle,
    CheckCircle2,
    Copy,
    Edit,
    Loader2,
    Plus,
    RotateCcw,
    Send,
    Smartphone,
    Trash2,
    User,
    X,
    XCircle,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

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

interface NotificationListProps {
    notifications: Notification[];
    onNotificationRead: (id: string) => void; // Changed from number to string
    onAllRead: () => void;
    onClose: () => void;
    hasMore?: boolean;
    onLoadMore?: () => void;
}

export function NotificationList({ notifications, onNotificationRead, onAllRead, onClose, hasMore = false, onLoadMore }: NotificationListProps) {
    const [loading, setLoading] = useState(false);
    const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());
    const [localNotifications, setLocalNotifications] = useState<Notification[]>(notifications);
    const [loadingMore, setLoadingMore] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const tenantRoute = useTenantRoute();

    // Update local notifications when props change
    useEffect(() => {
        setLocalNotifications(notifications);
    }, [notifications]);

    // Handle scroll to load more notifications
    const handleScroll = useCallback(
        (e: React.UIEvent<HTMLDivElement>) => {
            const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;

            // Load more when user scrolls to 80% of the content
            if (scrollTop + clientHeight >= scrollHeight * 0.8 && hasMore && !loadingMore && onLoadMore) {
                setLoadingMore(true);
                onLoadMore();
            }
        },
        [hasMore, loadingMore, onLoadMore],
    );

    // Reset loading more state when notifications change
    useEffect(() => {
        setLoadingMore(false);
    }, [notifications]);

    const markAsRead = async (notificationId: string) => {
        try {
            setLoadingIds((prev) => new Set(prev).add(notificationId));

            // Update local state immediately for better UX
            setLocalNotifications((prev) =>
                prev.map((notification) =>
                    notification.id === notificationId ? { ...notification, read_at: new Date().toISOString() } : notification,
                ),
            );

            // Call the API to mark notification as read
            await router.post(
                tenantRoute('notifications.mark-read'),
                {
                    notification_id: notificationId,
                },
                {
                    preserveState: true,
                    preserveScroll: true,
                    onSuccess: () => {
                        // Call the parent callback to update local state
                        onNotificationRead(notificationId);
                    },
                    onError: () => {
                        // Revert local state if API call fails
                        setLocalNotifications((prev) =>
                            prev.map((notification) => (notification.id === notificationId ? { ...notification, read_at: null } : notification)),
                        );
                    },
                },
            );
        } catch {
            // Revert local state if API call fails
            setLocalNotifications((prev) =>
                prev.map((notification) => (notification.id === notificationId ? { ...notification, read_at: null } : notification)),
            );
        } finally {
            setLoadingIds((prev) => {
                const newSet = new Set(prev);
                newSet.delete(notificationId);
                return newSet;
            });
        }
    };

    const markAllAsRead = async () => {
        try {
            setLoading(true);

            // Update local state immediately for better UX
            setLocalNotifications((prev) => prev.map((notification) => ({ ...notification, read_at: new Date().toISOString() })));

            // Call the API to mark all notifications as read
            await router.post(
                tenantRoute('notifications.mark-all-read'),
                {},
                {
                    preserveState: true,
                    preserveScroll: true,
                    onSuccess: () => {
                        // Call the parent callback to update local state
                        onAllRead();
                    },
                    onError: () => {
                        // Revert local state if API call fails
                        setLocalNotifications(notifications);
                    },
                },
            );
        } catch {
            // Revert local state if API call fails
            setLocalNotifications(notifications);
        } finally {
            setLoading(false);
        }
    };

    const getNotificationIcon = (notificationType: string) => {
        switch (notificationType) {
            case 'fcm_token_registered':
                return <Smartphone className="h-5 w-5 text-primary" />;
            case 'user_invited':
                return <User className="h-5 w-5 text-primary" />;
            case 'user_role_updated':
                return <RotateCcw className="h-5 w-5 text-primary" />;
            case 'user_disabled':
                return <Ban className="h-5 w-5 text-primary" />;
            case 'user_enabled':
                return <CheckCircle2 className="h-5 w-5 text-primary" />;
            case 'user_deleted':
                return <Trash2 className="h-5 w-5 text-primary" />;
            case 'role_created':
                return <Plus className="h-5 w-5 text-primary" />;
            case 'role_updated':
                return <Edit className="h-5 w-5 text-primary" />;
            case 'role_deleted':
                return <Copy className="h-5 w-5 text-primary" />;
            case 'invite_cancelled':
                return <XCircle className="h-5 w-5 text-primary" />;
            case 'invite_resent':
                return <Send className="h-5 w-5 text-primary" />;
            default:
                return <Bell className="h-5 w-5 text-primary" />;
        }
    };

    return (
        <div className="ring-opacity-50 absolute right-0 z-50 mt-2 w-96 rounded-lg border border-border bg-background shadow-2xl ring-1 ring-border backdrop-blur-sm">
            {/* Header */}
            <div className="rounded-t-lg border-b border-border bg-muted/50 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Bell className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-semibold text-foreground">Notifications</h3>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            onClick={markAllAsRead}
                            disabled={loading}
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:bg-muted hover:text-foreground"
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                        </Button>
                        <Button onClick={onClose} variant="ghost" size="sm" className="text-muted-foreground hover:bg-muted hover:text-foreground">
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto bg-background" ref={scrollRef} onScroll={handleScroll}>
                {localNotifications.length === 0 ? (
                    <div className="p-8 text-center">
                        <Bell className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">No notifications yet</p>
                        <p className="mt-1 text-xs text-muted-foreground/70">We'll notify you when something important happens</p>
                    </div>
                ) : (
                    <div className="divide-y divide-border">
                        {localNotifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`p-4 transition-colors duration-200 hover:bg-muted/50 ${
                                    notification.read_at ? 'bg-background' : 'bg-muted/30'
                                }`}
                            >
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0">
                                        <div className="text-primary">{getNotificationIcon(notification.notification_type)}</div>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className={`text-sm font-medium ${notification.read_at ? 'text-muted-foreground' : 'text-foreground'}`}>
                                            {notification.title}
                                        </p>
                                        <p className={`mt-1 text-sm ${notification.read_at ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
                                            {notification.message}
                                        </p>
                                        <div className="mt-2 flex items-center space-x-2">
                                            <p className="text-xs text-muted-foreground">
                                                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                            </p>
                                            {!notification.read_at && (
                                                <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                                                    New
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {!notification.read_at && (
                                        <Button
                                            onClick={() => markAsRead(notification.id)}
                                            disabled={loading || loadingIds.has(notification.id)}
                                            variant="ghost"
                                            size="sm"
                                            className="ml-2 text-muted-foreground hover:bg-primary/10 hover:text-primary"
                                        >
                                            {loadingIds.has(notification.id) ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Check className="h-4 w-4" />
                                            )}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                        {loadingMore && (
                            <div className="p-4 text-center text-muted-foreground">
                                <Loader2 className="h-6 w-6 animate-spin" />
                                <p>Loading more notifications...</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
