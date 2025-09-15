<?php

namespace App\Policies;

use App\Models\TenantUser;
use Illuminate\Auth\Access\HandlesAuthorization;

class UserPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any users.
     */
    public function viewAny(TenantUser $user): bool
    {
        return $user->can('View User');
    }

    /**
     * Determine whether the user can view the user.
     */
    public function view(TenantUser $user, TenantUser $model): bool
    {
        return $user->can('View User') || $user->id === $model->id;
    }

    /**
     * Determine whether the user can create users.
     */
    public function create(TenantUser $user): bool
    {
        return $user->can('Invite User');
    }

    /**
     * Determine whether the user can delete the user.
     */
    public function delete(TenantUser $user, TenantUser $model): bool
    {
        // Users can delete themselves or others if they have the Manage User permission
        if ($user->id === $model->id) {
            return true;
        }

        // Check if this is an admin user and if they're the only admin
        if ($this->isAdminUser($model) && $this->isOnlyAdminUser($model)) {
            return false;
        }

        return $user->can('Manage User');
    }

    /**
     * Determine whether the user can assign roles to the user.
     */
    public function assignRoles(TenantUser $user, TenantUser $model): bool
    {
        return $user->can('Manage User');
    }

    /**
     * Determine whether the user can disable the user.
     */
    public function disable(TenantUser $user, TenantUser $model): bool
    {
        if ($user->id === $model->id) {
            return false; // Users cannot disable themselves
        }

        // Check if this is an admin user and if they're the only admin
        if ($this->isAdminUser($model) && $this->isOnlyAdminUser($model)) {
            return false;
        }

        return $user->can('Manage User');
    }

    /**
     * Determine whether the user can enable the user.
     */
    public function enable(TenantUser $user, TenantUser $model): bool
        {
        if ($user->id === $model->id) {
            return false; // Users cannot enable themselves
        }

        return $user->can('Manage User'); // Use same permission as disable
    }

    /**
     * Determine whether the user can invite users.
     */
    public function invite(TenantUser $user): bool
    {
        return $user->can('Invite User');
    }

    /**
     * Determine whether the user can cancel invites.
     */
    public function cancelInvite(TenantUser $user): bool
    {
        return $user->can('Invite User');
    }

    /**
     * Determine whether the user can resend invites.
     */
    public function resendInvite(TenantUser $user): bool
    {
        return $user->can('Invite User');
    }

    /**
     * Determine whether the user can delete invites.
     */
    public function deleteInvite(TenantUser $user): bool
    {
        return $user->can('Invite User');
    }

    /**
     * Check if a user is an admin user
     */
    private function isAdminUser(TenantUser $user): bool
    {
        return $user->hasRole('Admin');
    }

    /**
     * Check if a user is the only admin user
     */
    private function isOnlyAdminUser(TenantUser $user): bool
    {
        if (! $this->isAdminUser($user)) {
            return false;
        }

        return TenantUser::role('Admin')->count() === 1;
    }
}
