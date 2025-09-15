<?php

namespace App\Policies;

use App\Models\ActivityLog;
use App\Models\TenantUser;

class ActivityLogPolicy
{
    /**
     * Determine whether the user can view any activity logs.
     */
    public function viewAny(TenantUser $user): bool
    {
        return $user->can('View Activity Log');
    }

    /**
     * Determine whether the user can view the activity log.
     */
    public function view(TenantUser $user, ActivityLog $activityLog): bool
    {
        return $user->can('View Activity Log');
    }
}
