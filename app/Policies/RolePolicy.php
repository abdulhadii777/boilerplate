<?php

namespace App\Policies;

use App\Models\Role;
use App\Models\TenantUser;
use Illuminate\Auth\Access\HandlesAuthorization;

class RolePolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any roles.
     */
    public function viewAny(TenantUser $user): bool
    {
        return $user->can('View Role');
    }

    /**
     * Determine whether the user can view the role.
     */
    public function view(TenantUser $user, Role $role): bool
    {
        return $user->can('View Role');
    }

    /**
     * Determine whether the user can create roles.
     */
    public function create(TenantUser $user): bool
    {
        return $user->can('Modify Roles');
    }

    /**
     * Determine whether the user can update the role.
     */
    public function update(TenantUser $user, Role $role): bool
    {
        if (! $user->can('Modify Roles')) {
            return false;
        }

        if ($role->isSystem()) {
            $this->deny('System roles cannot be modified.');
        }

        // Check if this is the Admin role and if editing it would leave the system without admin users
        if ($role->isAdmin()) {
            $adminUsers = $role->users()->count();
            if ($adminUsers <= 1) {
                $this->deny('Admin role cannot be modified when only one user has admin privileges. Please assign the Admin role to another user first.');
            }
        }

        return true;
    }

    /**
     * Determine whether the user can delete the role.
     */
    public function delete(TenantUser $user, Role $role): bool
    {
        if (! $user->can('Modify Roles')) {
            return false;
        }

        if ($role->isSystem()) {
            $this->deny('System roles cannot be deleted.');
        }

        if ($role->users()->count() > 0) {
            $this->deny('Cannot delete role that has assigned users. Please reassign or remove users from this role first.');
        }

        return true;
    }

    /**
     * Determine whether the user can copy the role.
     */
    public function copy(TenantUser $user, Role $role): bool
    {
        if (! $user->can('Modify Roles')) {
            return false;
        }

        if ($role->isSystem()) {
            $this->deny('System roles cannot be copied.');
        }

        return true;
    }
}
