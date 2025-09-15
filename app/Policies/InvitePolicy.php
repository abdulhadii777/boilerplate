<?php

namespace App\Policies;

use App\Models\Invite;
use App\Models\TenantUser;
use Illuminate\Auth\Access\HandlesAuthorization;

class InvitePolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any invites.
     */
    public function viewAny(TenantUser $user): bool
    {
        return $user->can('View Invite');
    }

    /**
     * Determine whether the user can view the invite.
     */
    public function view(TenantUser $user, Invite $invite): bool
    {
        return $user->can('View Invite');
    }

    /**
     * Determine whether the user can create invites.
     */
    public function create(TenantUser $user): bool
    {
        return $user->can('Invite User');
    }

    /**
     * Determine whether the user can update the invite.
     */
    public function update(TenantUser $user, Invite $invite): bool
    {
        return $user->can('Invite User');
    }

    /**
     * Determine whether the user can delete the invite.
     */
    public function delete(TenantUser $user, Invite $invite): bool
    {
        return $user->can('Invite User');
    }

    /**
     * Determine whether the user can cancel the invite.
     */
    public function cancel(TenantUser $user, Invite $invite): bool
    {
        return $user->can('Invite User');
    }

    /**
     * Determine whether the user can resend the invite.
     */
    public function resend(TenantUser $user, Invite $invite): bool
    {
        return $user->can('Invite User');
    }
}
