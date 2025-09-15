<?php

namespace App\Listeners\Notification;

use App\Events\UserEvent;
use App\Models\NotificationSetting;
use App\Notifications\UserNotification;

class SendUserNotifications extends BaseNotificationListener
{
    public function handle(UserEvent $event): void
    {
        // Initialize tenant context
        if (!$this->initializeTenantContext()) {
            \Log::warning('SendUserNotifications: Could not initialize tenant context, skipping notification');
            return;
        }

        // Get all users who have notifications enabled for this event type
        $subscriptions = NotificationSetting::where('event_type', "user_{$event->action}")
            ->where(function ($query) {
                $query->where('email_enabled', true)
                    ->orWhere('push_enabled', true)
                    ->orWhere('in_app_enabled', true);
            })
            ->with('user')
            ->get();

        foreach ($subscriptions as $subscription) {
            $user = $subscription->user;

            // Only send notifications to users who can perform the action
            if (! $this->shouldReceiveNotification($user, "user_{$event->action}", $event)) {
                continue;
            }

            // Send notification with user's preferred channels
            $channels = $this->getEnabledChannels($subscription);

            if (! empty($channels)) {
                $notification = new UserNotification($event->user, $event->action, $event->metadata);
                $user->notify($notification);
            }
        }
    }
}
