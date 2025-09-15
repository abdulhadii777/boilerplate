import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/manage-profile/layout';
import { hasPermission, isSupported, onForegroundMessage, removeForegroundMessageHandler, requestPermissionAndGetToken } from '@/lib/firebase';
import type { MainPageProps, BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { AlertCircle, Bell, BellOff, CheckCircle, Mail, Smartphone } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTenantRoute } from '@/utils/tenantRoute';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Notification settings',
        name: 'notifications.edit',
    },
];

interface NotificationSetting { 
    id: number;
    event_type: string;
    email_enabled: boolean;
    push_enabled: boolean;
    in_app_enabled: boolean;
}

interface NotificationSettingsProps {
    settings: Record<string, NotificationSetting>;
    availableEvents: Record<string, string>;
    unreadCount: number;
}

interface FCMTokensResponse {
    flash?: {
        fcmTokens?: {
            success?: boolean;
            tokens?: Array<{ token: string }>;
        };
    };
}

export default function NotificationSettings({ settings: initialSettings, availableEvents: initialAvailableEvents }: NotificationSettingsProps) {
    const [settings, setSettings] = useState<Record<string, NotificationSetting>>(initialSettings);
    const [availableEvents] = useState<Record<string, string>>(initialAvailableEvents);
    const tenantRoute = useTenantRoute()

    // FCM State
    const [firebaseSupported, setFirebaseSupported] = useState(false);
    const [notificationPermission, setNotificationPermission] = useState(false);
    const [currentToken, setCurrentToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showDisableNote, setShowDisableNote] = useState(false);

    useEffect(() => {
        // Check if Firebase is supported
        setFirebaseSupported(isSupported());

        // Check current permission status
        checkPermissionStatus();

        // Check if user already has a stored token
        checkExistingToken();

        // Cleanup function to remove foreground message handler when component unmounts
        return () => {
            removeForegroundMessageHandler();
        };
    }, []);

    const checkPermissionStatus = async () => {
        try {
            const permission = await hasPermission();
            setNotificationPermission(permission);
        } catch {
            // Silent error handling
        }
    };

    const checkExistingToken = async () => {
        try {
            // Check if user already has a stored token in the backend using Inertia
            router.get(
                tenantRoute('notifications.fcm-tokens'),
                {},
                {
                    preserveState: true,
                    preserveScroll: true,
                    onSuccess: (page) => {
                        // Access the response data from the session flash data
                        const session = page.props as FCMTokensResponse;
                        if (session.flash?.fcmTokens?.success && session.flash.fcmTokens?.tokens && session.flash.fcmTokens.tokens.length > 0) {
                            setCurrentToken(session.flash.fcmTokens.tokens[0].token);
                            setNotificationPermission(true);
                            // Start listening for messages since we already have a token
                            // Only call if not already active
                            onForegroundMessage();
                        }
                    },
                    onError: () => {
                        // Silent error handling
                    },
                },
            );
        } catch {
            // Silent error handling
        }
    };

    const handleEnableNotifications = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const token = await requestPermissionAndGetToken();

            if (token) {
                // Send token to Laravel backend using Inertia
                router.post(
                    tenantRoute('notifications.save-fcm-token'),
                    {
                        token,
                        device_type: 'web',
                        device_name: getDeviceName(),
                    },
                    {
                        preserveState: true,
                        preserveScroll: true,
                        onSuccess: () => {
                            setCurrentToken(token);
                            setNotificationPermission(true);
                            setShowDisableNote(false);
                            setError(null);
                            // No need to call onForegroundMessage again - it's already active from checkExistingToken
                            // or will be set up when the component re-renders
                        },
                        onError: () => {
                            setError('Failed to save token to backend');
                        },
                        onFinish: () => {
                            setIsLoading(false);
                        },
                    },
                );
            } else {
                setError('Failed to get notification token');
                setIsLoading(false);
            }
        } catch {
            setError('Error enabling notifications');
            setIsLoading(false);
        }
    };

    const handleDisableNotifications = async () => {
        if (currentToken) {
            setShowDisableNote(true);

            // Delete token using Inertia - use post with _method: DELETE
            router.post(
                tenantRoute('notifications.fcm-token'),
                {
                    _method: 'DELETE',
                    token: currentToken,
                },
                {
                    preserveState: true,
                    preserveScroll: true,
                    onSuccess: () => {
                        setCurrentToken(null);
                        setNotificationPermission(false);
                        setError(null);
                        // Keep the note visible for a moment so user can read it
                        setTimeout(() => setShowDisableNote(false), 5000);
                    },
                    onError: () => {
                        setError('Error disabling notifications');
                    },
                },
            );
        } else {
            setError('No active notification token found');
        }
    };

    const getDeviceName = (): string => {
        const userAgent = navigator.userAgent;

        if (userAgent.includes('Chrome')) {
            return 'Chrome';
        } else if (userAgent.includes('Firefox')) {
            return 'Firefox';
        } else if (userAgent.includes('Safari')) {
            return 'Safari';
        } else if (userAgent.includes('Edge')) {
            return 'Edge';
        }

        return 'Web Browser';
    };

    const handleToggle = async (eventType: string, channel: 'email_enabled' | 'push_enabled' | 'in_app_enabled') => {
        const newValue = !settings[eventType]?.[channel];

        // Update local state immediately
        setSettings((prev) => ({
            ...prev,
            [eventType]: {
                ...prev[eventType],
                [channel]: newValue,
            },
        }));

        // Make Inertia call
        try {
            router.put(
                tenantRoute('notifications.settings'),
                {
                    event_type: eventType,
                    email_enabled: channel === 'email_enabled' ? newValue : settings[eventType]?.email_enabled,
                    push_enabled: channel === 'push_enabled' ? newValue : settings[eventType]?.push_enabled,
                    in_app_enabled: channel === 'in_app_enabled' ? newValue : settings[eventType]?.in_app_enabled,
                },
                {
                    preserveState: true,
                    preserveScroll: true,
                    onError: () => {
                        // Revert local state if Inertia call fails
                        setSettings((prev) => ({
                            ...prev,
                            [eventType]: {
                                ...prev[eventType],
                                [channel]: !newValue,
                            },
                        }));
                    },
                },
            );
        } catch {
            // Revert local state if Inertia call fails
            setSettings((prev) => ({
                ...prev,
                [eventType]: {
                    ...prev[eventType],
                    [channel]: !newValue,
                },
            }));
        }
    };

    const getEventDescription = (eventType: string) => {
        const descriptions: Record<string, string> = {
            user_invited: 'When a new user is invited to the system',
            user_role_updated: "When a user's role is changed",
            user_disabled: 'When a user account is disabled',
            user_enabled: 'When a user account is re-enabled',
            user_deleted: 'When a user account is deleted',
            role_created: 'When a new role is created',
            role_updated: 'When a role is modified',
            role_deleted: 'When a role is removed',
            invite_cancelled: 'When a user invitation is cancelled',
            invite_resent: 'When a user invitation is resent',
        };
        return descriptions[eventType] || 'Notification for this event type';
    };

    // Don't render push notifications section if Firebase is not supported
    if (!firebaseSupported) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Notification settings" />
                <SettingsLayout>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold tracking-tight">Notification Settings</h2>
                            <p className="text-muted-foreground">Configure how you receive notifications for different events.</p>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BellOff className="h-5 w-5 text-muted-foreground" />
                                    Push Notifications
                                </CardTitle>
                                <CardDescription>Push notifications are not supported in this browser</CardDescription>
                            </CardHeader>
                        </Card>

                        {/* Individual Notification Settings */}
                        <div className="space-y-6">
                            {Object.entries(availableEvents).map(([eventType, eventName]) => {
                                const setting = settings[eventType];
                                if (!setting) return null;

                                return (
                                    <Card key={eventType}>
                                        <CardHeader>
                                            <div>
                                                <CardTitle className="text-lg">{eventName}</CardTitle>
                                                <CardDescription>{getEventDescription(eventType)}</CardDescription>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid gap-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                                        <div>
                                                            <Label htmlFor={`email-${eventType}`} className="text-sm font-medium">
                                                                Email Notifications
                                                            </Label>
                                                            <p className="text-xs text-muted-foreground">Receive notifications via email</p>
                                                        </div>
                                                    </div>
                                                    <Switch
                                                        id={`email-${eventType}`}
                                                        checked={setting.email_enabled}
                                                        onCheckedChange={() => handleToggle(eventType, 'email_enabled')}
                                                    />
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <Smartphone className="h-4 w-4 text-muted-foreground" />
                                                        <div>
                                                            <Label htmlFor={`push-${eventType}`} className="text-sm font-medium">
                                                                Push Notifications
                                                            </Label>
                                                            <p className="text-xs text-muted-foreground">Receive notifications on your device</p>
                                                        </div>
                                                    </div>
                                                    <Switch
                                                        id={`push-${eventType}`}
                                                        checked={setting.push_enabled}
                                                        onCheckedChange={() => handleToggle(eventType, 'push_enabled')}
                                                    />
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <Bell className="h-4 w-4 text-muted-foreground" />
                                                        <div>
                                                            <Label htmlFor={`in-app-${eventType}`} className="text-sm font-medium">
                                                                In-App Notifications
                                                            </Label>
                                                            <p className="text-xs text-muted-foreground">Show notifications within the application</p>
                                                        </div>
                                                    </div>
                                                    <Switch
                                                        id={`in-app-${eventType}`}
                                                        checked={setting.in_app_enabled}
                                                        onCheckedChange={() => handleToggle(eventType, 'in_app_enabled')}
                                                    />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}

                            {Object.keys(availableEvents).length === 0 && (
                                <Card className="md:col-span-2">
                                    <CardContent className="py-8 text-center">
                                        <p className="text-muted-foreground">No notification events available.</p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </SettingsLayout>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Notification settings" />

            <SettingsLayout>
                <div className="space-y-6">
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold tracking-tight">Notification Settings</h2>
                        <p className="text-muted-foreground">Configure how you receive notifications for different events.</p>
                    </div>

                    {/* Push Notifications Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Bell className="h-5 w-5" />
                                Push Notifications
                            </CardTitle>
                            <CardDescription>Enable push notifications to receive real-time updates</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Status Display */}
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Status:</span>
                                <div className="flex items-center gap-2">
                                    {notificationPermission ? (
                                        <Badge variant="default" className="bg-green-100 text-green-800">
                                            <CheckCircle className="mr-1 h-3 w-3" />
                                            Enabled
                                        </Badge>
                                    ) : (
                                        <Badge variant="secondary">
                                            <AlertCircle className="mr-1 h-3 w-3" />
                                            Disabled
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            {/* Error Display */}
                            {error && <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

                            {/* Additional Info - Only shown when disable button is clicked */}
                            {showDisableNote && (
                                <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
                                    <strong>Note:</strong> Disabling notifications will stop FCM messages but won't revoke browser permission. To
                                    completely remove browser permission, use your browser settings.
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-2">
                                {!notificationPermission ? (
                                    <Button onClick={handleEnableNotifications} disabled={isLoading} className="flex-1">
                                        {isLoading ? 'Enabling...' : 'Enable Notifications'}
                                    </Button>
                                ) : (
                                    <Button variant="outline" onClick={handleDisableNotifications} className="flex-1">
                                        Disable Notifications
                                    </Button>
                                )}
                            </div>

                            {/* Help Text */}
                            <div className="text-xs text-muted-foreground">
                                {notificationPermission
                                    ? 'You will receive push notifications for important updates. Click "Disable Notifications" to stop receiving FCM messages.'
                                    : 'Click "Enable Notifications" to allow push notifications from this site'}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Individual Notification Settings */}
                    <div className="space-y-6">
                        {Object.entries(availableEvents).map(([eventType, eventName]) => {
                            const setting = settings[eventType];
                            if (!setting) return null;

                            return (
                                <Card key={eventType}>
                                    <CardHeader>
                                        <div>
                                            <CardTitle className="text-lg">{eventName}</CardTitle>
                                            <CardDescription>{getEventDescription(eventType)}</CardDescription>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid gap-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                                    <div>
                                                        <Label htmlFor={`email-${eventType}`} className="text-sm font-medium">
                                                            Email Notifications
                                                        </Label>
                                                        <p className="text-xs text-muted-foreground">Receive notifications via email</p>
                                                    </div>
                                                </div>
                                                <Switch
                                                    id={`email-${eventType}`}
                                                    checked={setting.email_enabled}
                                                    onCheckedChange={() => handleToggle(eventType, 'email_enabled')}
                                                />
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <Smartphone className="h-4 w-4 text-muted-foreground" />
                                                    <div>
                                                        <Label htmlFor={`push-${eventType}`} className="text-sm font-medium">
                                                            Push Notifications
                                                        </Label>
                                                        <p className="text-xs text-muted-foreground">Receive notifications on your device</p>
                                                    </div>
                                                </div>
                                                <Switch
                                                    id={`push-${eventType}`}
                                                    checked={setting.push_enabled}
                                                    onCheckedChange={() => handleToggle(eventType, 'push_enabled')}
                                                />
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <Bell className="h-4 w-4 text-muted-foreground" />
                                                    <div>
                                                        <Label htmlFor={`in-app-${eventType}`} className="text-sm font-medium">
                                                            In-App Notifications
                                                        </Label>
                                                        <p className="text-xs text-muted-foreground">Show notifications within the application</p>
                                                    </div>
                                                </div>
                                                <Switch
                                                    id={`in-app-${eventType}`}
                                                    checked={setting.in_app_enabled}
                                                    onCheckedChange={() => handleToggle(eventType, 'in_app_enabled')}
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}

                        {Object.keys(availableEvents).length === 0 && (
                            <Card className="md:col-span-2">
                                <CardContent className="py-8 text-center">
                                    <p className="text-muted-foreground">No notification events available.</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
