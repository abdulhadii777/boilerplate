<?php

namespace App\Listeners\Notification;

use App\Events\RoleEvent;
use App\Models\NotificationSetting;
use App\Notifications\RoleNotification;

class SendRoleNotifications extends BaseNotificationListener
{
    public function handle(RoleEvent $event): void
    {
        // Initialize tenant context
        if (!$this->initializeTenantContext()) {
            \Log::warning('SendRoleNotifications: Could not initialize tenant context, skipping notification');
            return;
        }

        // Get all users who have notifications enabled for this event type
        $eventType = "role_{$event->action}";

        $subscriptions = NotificationSetting::where('event_type', $eventType)
            ->where(function ($query) {
                $query->where('email_enabled', true)
                    ->orWhere('push_enabled', true)
                    ->orWhere('in_app_enabled', true);
            })
            ->with('user')
            ->get();

        $processedCount = 0;
        $skippedCount = 0;
        $sentCount = 0;

        foreach ($subscriptions as $subscription) {
            $user = $subscription->user;
            $processedCount++;

            // Only send notifications to users who can perform the action
            if (! $this->shouldReceiveNotification($user, $eventType, $event)) {
                $skippedCount++;

                continue;
            }

            // Send notification with user's preferred channels
            $channels = $this->getEnabledChannels($subscription);

            if (! empty($channels)) {
                $notification = new RoleNotification($event->role, $event->action, $event->metadata);
                $user->notify($notification);
                $sentCount++;
            }
        }
    }
}
