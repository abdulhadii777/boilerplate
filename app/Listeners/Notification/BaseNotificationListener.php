<?php

namespace App\Listeners\Notification;

use App\Models\NotificationSetting;
use App\Models\TenantUser;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Stancl\Tenancy\Facades\Tenancy;

abstract class BaseNotificationListener implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * The number of times the job may be attempted.
     */
    public int $tries = 3;

    /**
     * The number of seconds the job can run before timing out.
     */
    public int $timeout = 60;

    /**
     * Initialize tenant context if not already initialized
     */
    protected function initializeTenantContext(): bool
    {
        if (tenancy()->initialized) {
            return true;
        }

        // Try to get tenant from the job payload or context
        $tenantId = $this->getTenantIdFromJob();
        
        if ($tenantId) {
            $tenant = \App\Models\Tenant::find($tenantId);
            if ($tenant) {
                tenancy()->initialize($tenant);
                return true;
            }
        }

        \Log::warning('BaseNotificationListener: Could not initialize tenant context');
        return false;
    }

    /**
     * Get tenant ID from job context
     */
    protected function getTenantIdFromJob(): ?string
    {
        // Try to get tenant ID from various sources
        if (isset($this->job) && isset($this->job->payload()['tenant_id'])) {
            return $this->job->payload()['tenant_id'];
        }

        // Try to get from current tenant
        if (tenancy()->tenant) {
            return tenancy()->tenant->id;
        }

        return null;
    }

    /**
     * Check if user has permission to manage users
     */
    protected function canManageUsers(TenantUser $user): bool
    {
        return $user->can('Manage User');
    }

    /**
     * Check if user has permission to modify roles
     */
    protected function canModifyRoles(TenantUser $user): bool
    {
        return $user->can('Modify Roles');
    }

    /**
     * Check if user has permission to invite users
     */
    protected function canInviteUsers(TenantUser $user): bool
    {
        return $user->can('Invite User');
    }

    /**
     * Get enabled channels for a user's notification settings
     */
    protected function getEnabledChannels(NotificationSetting $setting): array
    {
        $channels = [];

        if ($setting->isEmailEnabled()) {
            $channels[] = 'mail';
        }

        if ($setting->isPushEnabled()) {
            $channels[] = \NotificationChannels\Fcm\FcmChannel::class;
        }

        if ($setting->isInAppEnabled()) {
            $channels[] = 'database';
        }

        return $channels;
    }

    /**
     * Check if user should receive notifications for a specific action
     * Only users who can perform the action should receive notifications about it
     */
    protected function shouldReceiveNotification(TenantUser $user, string $action, $event = null): bool
    {
        // Don't send notifications to the user who performed the action
        if (isset($event->metadata['performer']) && $user->id === $event->metadata['performer']) {
            return false;
        }

        return match ($action) {
            // User actions - only users who can manage users should get notifications
            'user_invited', 'user_role_updated', 'user_disabled', 'user_enabled', 'user_deleted' => $this->canManageUsers($user),

            // Role actions - only users who can modify roles should get notifications
            'role_created', 'role_updated', 'role_deleted' => $this->canModifyRoles($user),

            // Invite actions - only users who can manage invites should get notifications
            'invite_sent', 'invite_cancelled', 'invite_resent' => $this->canInviteUsers($user),

            default => false,
        };
    }
}
