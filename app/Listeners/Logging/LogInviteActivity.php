<?php

namespace App\Listeners\Logging;

use App\Events\InviteEvent;
use App\Services\ActivityLogService;
use Stancl\Tenancy\Facades\Tenancy;

class LogInviteActivity
{
    public function __construct(
        private ActivityLogService $activityLogService
    ) {}

    public function handle(InviteEvent $event): void
    {
        // Ensure we're in a tenant context
        if (!tenancy()->initialized) {
            \Log::warning('LogInviteActivity: Not in tenant context, skipping activity log');
            return;
        }

        $invite = $event->invite;
        $action = $event->action;

        switch ($action) {
            case 'sent':
                $roleName = $invite->role->name ?? 'Unknown Role';
                $details = "{$invite->email} was invited with role {$roleName}";
                if ($invite->invitedBy) {
                    $details .= " by {$invite->invitedBy->name}";
                }
                $details .= ' on '.now()->format('M j, Y \a\t g:i A');

                $this->activityLogService->log('User', 'Invite User', $details, $invite->invited_by);
                break;

            case 'accepted':
                $roleName = $invite->role->name ?? 'Unknown Role';
                $details = "{$invite->email} accepted invitation with role {$roleName} on ".now()->format('M j, Y \a\t g:i A');

                $this->activityLogService->log('User', 'Accept Invite', $details);
                break;

            case 'resent':
                $details = "Invitation to {$invite->email} was resent";
                if ($invite->invitedBy) {
                    $details .= " by {$invite->invitedBy->name}";
                }
                $details .= ' on '.now()->format('M j, Y \a\t g:i A');

                $this->activityLogService->log('User', 'Resend Invite', $details, $invite->invited_by);
                break;

            case 'cancelled':
                $details = "Invitation to {$invite->email} was cancelled";
                if ($invite->invitedBy) {
                    $details .= " by {$invite->invitedBy->name}";
                }
                $details .= ' on '.now()->format('M j, Y \a\t g:i A');

                $this->activityLogService->log('User', 'Cancel Invite', $details, $invite->invited_by);
                break;
        }
    }
}
