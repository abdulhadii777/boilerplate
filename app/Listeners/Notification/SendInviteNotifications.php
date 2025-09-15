<?php

namespace App\Listeners\Notification;

use App\Events\InviteEvent;
use App\Models\NotificationSetting;
use App\Notifications\InviteNotification;

class SendInviteNotifications extends BaseNotificationListener
{
    public function handle(InviteEvent $event): void
    {
        // Initialize tenant context
        if (!$this->initializeTenantContext()) {
            \Log::warning('SendInviteNotifications: Could not initialize tenant context, skipping notification');
            return;
        }

         // Get all users who have notifications enabled for this event type
         $subscriptions = NotificationSetting::where('event_type', "invite_{$event->action}")
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
         if (! $this->shouldReceiveNotification($user, "invite_{$event->action}", $event)) {
             continue;
         }
         // Send notification with user's preferred channels
         $channels = $this->getEnabledChannels($subscription);

         if (! empty($channels)) {
             $notification = new InviteNotification($event->invite, $event->action, $event->metadata);
             $user->notify($notification);
         }
     }
    }
}
