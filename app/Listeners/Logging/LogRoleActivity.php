<?php

namespace App\Listeners\Logging;

use App\Events\RoleEvent;
use App\Services\ActivityLogService;
use Stancl\Tenancy\Facades\Tenancy;

class LogRoleActivity
{
    public function __construct(
        private ActivityLogService $activityLogService
    ) {}

    public function handle(RoleEvent $event): void
    {
        // Ensure we're in a tenant context
        if (!tenancy()->initialized) {
            \Log::warning('LogRoleActivity: Not in tenant context, skipping activity log');
            return;
        }

        $role = $event->role;
        $action = $event->action;

        switch ($action) {
            case 'created':
                $details = "Role '{$role->name}' was created on ".now()->format('M j, Y \a\t g:i A');
                $this->activityLogService->log('Role', 'Create Role', $details);
                break;

            case 'updated':
                $details = "Role '{$role->name}' was updated on ".now()->format('M j, Y \a\t g:i A');
                $this->activityLogService->log('Role', 'Update Role', $details);
                break;

            case 'deleted':
                $details = "Role '{$role->name}' was deleted on ".now()->format('M j, Y \a\t g:i A');
                $this->activityLogService->log('Role', 'Delete Role', $details);
                break;

            default:
                // Log any other role actions
                $details = "Role '{$role->name}' - {$action} on ".now()->format('M j, Y \a\t g:i A');
                $this->activityLogService->log('Role', ucfirst(str_replace('_', ' ', $action)), $details);
                break;
        }
    }
}
