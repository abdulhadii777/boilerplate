<?php

namespace App\Policies;

use App\Models\User;

class RoleManagementPolicy
{
    /**
     * Determine whether the user can view role management.
     */
    public function viewAny(User $user): bool
    {
        return $user->can('manage_roles');
    }

    /**
     * Determine whether the user can create roles.
     */
    public function create(User $user): bool
    {
        return $user->can('manage_roles');
    }

    /**
     * Determine whether the user can grant roles.
     */
    public function grant(User $user): bool
    {
        return $user->can('grant_roles');
    }

    /**
     * Determine whether the user can revoke roles.
     */
    public function revoke(User $user): bool
    {
        return $user->can('revoke_roles');
    }

    /**
     * Determine whether the user can manage owner roles.
     */
    public function manageOwner(User $user): bool
    {
        return $user->can('manage_owner_roles');
    }

    /**
     * Determine whether the user can grant a specific role.
     */
    public function grantRole(User $user, string $role): bool
    {
        // Only owners can grant owner role
        if ($role === 'owner') {
            return $user->hasRole('owner');
        }

        // Owners and admins can grant admin and member roles
        return $user->hasRole(['owner', 'admin']);
    }

    /**
     * Determine whether the user can revoke a specific role.
     */
    public function revokeRole(User $user, string $role, User $targetUser): bool
    {
        // Can't revoke your own owner role
        if ($role === 'owner' && $user->id === $targetUser->id) {
            return false;
        }

        // Only owners can revoke owner role
        if ($role === 'owner') {
            return $user->hasRole('owner');
        }

        // Owners and admins can revoke admin and member roles
        return $user->hasRole(['owner', 'admin']);
    }
}