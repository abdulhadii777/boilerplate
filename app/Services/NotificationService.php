<?php

namespace App\Services;

use App\Models\NotificationSetting;
use App\Models\TenantUser;

class NotificationService
{
    /**
     * Create default notification settings for a user
     */
    public function createDefaultSettings(TenantUser $user): void
    {
        $eventTypes = NotificationSetting::getAvailableEventTypes();

        foreach (array_keys($eventTypes) as $eventType) {
            // Only create if it doesn't exist - don't override user preferences
            if (! $user->notificationSettings()->where('event_type', $eventType)->exists()) {
                NotificationSetting::create([
                    'user_id' => $user->id,
                    'event_type' => $eventType,
                    'email_enabled' => true,
                    'push_enabled' => true,
                    'in_app_enabled' => true,
                ]);
            }
        }
    }

    /**
     * Check if user has notification settings
     */
    public function hasSettings(TenantUser $user): bool
    {
        return $user->notificationSettings()->exists();
    }

    /**
     * Ensure user has notification settings, create if missing
     */
    public function ensureSettings(TenantUser $user): void
    {
        if (! $this->hasSettings($user)) {
            $this->createDefaultSettings($user);
        }
    }

    /**
     * Update user's notification settings
     */
    public function updateSettings(TenantUser $user, string $eventType, array $settings): void
    {
        // Ensure user has settings before updating
        $this->ensureSettings($user);

        NotificationSetting::updateOrCreate(
            ['user_id' => $user->id, 'event_type' => $eventType],
            $settings
        );
    }

    /**
     * Get user's unread notification count
     */
    public function getUnreadCount(TenantUser $user): int
    {
        return $user->unreadNotifications()->count();
    }

    /**
     * Mark notification as read
     */
    public function markAsRead(string $notificationId, TenantUser $user): bool
    {
        $notification = $user->notifications()->find($notificationId);

        if ($notification) {
            $notification->markAsRead();

            return true;
        }

        return false;
    }

    /**
     * Mark all notifications as read for a user
     */
    public function markAllAsRead(TenantUser $user): void
    {
        $user->unreadNotifications()->update(['read_at' => now()]);
    }

    /**
     * Get user's notification settings for a specific event type
     */
    public function getSettings(TenantUser $user, string $eventType): ?NotificationSetting
    {
        return $user->notificationSettings()
            ->where('event_type', $eventType)
            ->first();
    }

    /**
     * Check if a specific notification type is enabled for a user
     */
    public function isNotificationEnabled(TenantUser $user, string $eventType, string $channel = 'email'): bool
    {
        $setting = $this->getSettings($user, $eventType);

        if (! $setting) {
            return true; // Default to enabled if no setting exists
        }

        return match ($channel) {
            'email' => $setting->isEmailEnabled(),
            'push' => $setting->isPushEnabled(),
            'in_app' => $setting->isInAppEnabled(),
            default => false,
        };
    }
}
