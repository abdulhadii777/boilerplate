<?php

namespace App\Listeners\Logging;

use App\Events\UserEvent;
use App\Services\ActivityLogService;
use Stancl\Tenancy\Facades\Tenancy;

class LogUserActivity
{
    public function __construct(
        private ActivityLogService $activityLogService
    ) {}

    public function handle(UserEvent $event): void
    {
        // Ensure we're in a tenant context
        if (!tenancy()->initialized) {
            \Log::warning('LogUserActivity: Not in tenant context, skipping activity log');
            return;
        }

        $user = $event->user;
        $action = $event->action;
        $metadata = $event->metadata;

        switch ($action) {
            case 'role_updated':
                $oldRole = $metadata['old_role'] ?? null;
                $newRole = $metadata['new_role'] ?? null;
                $oldRoleName = $oldRole ? $oldRole->name : 'No Role';
                $newRoleName = $newRole ? $newRole->name : 'No Role';
                $details = "User {$user->name} role changed from {$oldRoleName} to {$newRoleName} on ".now()->format('M j, Y \a\t g:i A');

                $this->activityLogService->log('User', 'Update Role', $details);
                break;

            case 'enabled':
                $details = "User {$user->name} was enabled on ".now()->format('M j, Y \a\t g:i A');
                $this->activityLogService->log('User', 'Enable User', $details);
                break;

            case 'disabled':
                $details = "User {$user->name} was disabled on ".now()->format('M j, Y \a\t g:i A');
                $this->activityLogService->log('User', 'Disable User', $details);
                break;

            case 'deleted':
                $details = "User {$user->name} was deleted on ".now()->format('M j, Y \a\t g:i A');
                $this->activityLogService->log('User', 'Delete User', $details);
                break;

            default:
                // Log any other user actions
                $details = "User {$user->name} - {$action} on ".now()->format('M j, Y \a\t g:i A');
                $this->activityLogService->log('User', ucfirst(str_replace('_', ' ', $action)), $details);
                break;
        }
    }
}
