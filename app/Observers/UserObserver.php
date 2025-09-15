<?php

namespace App\Observers;

use App\Events\UserEvent;
use App\Models\NotificationSetting;
use App\Models\TenantUser;

class UserObserver
{
    /**
     * Handle the User "created" event.
     */
    public function created(TenantUser $user): void
    {
        // checki if not already created
        if ($user->notificationSettings()->exists()) {
            return;
        }

        // Create default notification settings for the new user
        $eventTypes = NotificationSetting::getAvailableEventTypes();

        foreach (array_keys($eventTypes) as $eventType) {
            NotificationSetting::create([
                'user_id' => $user->id,
                'event_type' => $eventType,
                'email_enabled' => true,
                'push_enabled' => true,
                'in_app_enabled' => true,
            ]);
        }
    }

    /**
     * Handle the User "updated" event.
     */
    public function updated(TenantUser $user): void
    {
        // Check if role was updated
        if ($user->wasChanged('role_id')) {
            $oldRole = $user->getOriginal('role_id') ? \App\Models\Role::find($user->getOriginal('role_id')) : null;
            $newRole = $user->role;

            event(new UserEvent($user, 'role_updated', [
                'old_role' => $oldRole,
                'new_role' => $newRole,
            ]));
        }

        // Check if user was enabled/disabled
        if ($user->wasChanged('is_disabled')) {
            $action = $user->is_disabled ? 'enabled' : 'disabled';
            event(new UserEvent($user, $action));
        }
    }

    /**
     * Handle the User "deleted" event.
     */
    public function deleted(TenantUser $user): void
    {
        event(new UserEvent($user, 'deleted'));
    }
}
