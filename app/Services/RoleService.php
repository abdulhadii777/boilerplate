<?php

namespace App\Services;

use App\Models\TenantRole;
use App\Models\TenantPermission;

class RoleService
{


    /**
     * Get the description for a role.
     */
    public function getRoleDescription(string $roleName): string
    {
        return match ($roleName) {
            'owner' => 'Full access to all organization features and settings',
            'admin' => 'Manage users and view analytics, can grant/revoke roles but cannot manage owner roles',
            'member' => 'Basic access to dashboard and analytics',
            default => 'Custom role with specific permissions',
        };
    }

    /**
     * Get the display name for a permission.
     */
    public function getPermissionDisplayName(string $permissionName): string
    {
        return match ($permissionName) {
            'view_dashboard' => 'View Dashboard',
            'manage_users' => 'Manage Users',
            'manage_roles' => 'Manage Roles',
            'view_analytics' => 'View Analytics',
            'manage_settings' => 'Manage Settings',
            'grant_roles' => 'Grant Roles',
            'revoke_roles' => 'Revoke Roles',
            'manage_owner_roles' => 'Manage Owner Roles',
            default => ucwords(str_replace('_', ' ', $permissionName)),
        };
    }

    /**
     * Get the description for a permission.
     */
    public function getPermissionDescription(string $permissionName): string
    {
        return match ($permissionName) {
            'view_dashboard' => 'Access to dashboard and basic information',
            'manage_users' => 'Add, edit, and remove organization users',
            'manage_roles' => 'Grant and revoke user roles',
            'view_analytics' => 'Access analytics and reporting features',
            'manage_settings' => 'Modify organization settings',
            'grant_roles' => 'Grant roles to users',
            'revoke_roles' => 'Revoke roles from users',
            'manage_owner_roles' => 'Manage owner role assignments',
            default => 'Custom permission for specific functionality',
        };
    }

    /**
     * Create a new role with permissions.
     */
    public function createRole(array $roleData): array
    {
        $role = TenantRole::create([
            'name' => $roleData['name'],
            'display_name' => $roleData['display_name'],
            'description' => $roleData['description'],
        ]);

        // Attach permissions if any
        if (isset($roleData['permissions']) && is_array($roleData['permissions'])) {
            $permissions = TenantPermission::whereIn('name', $roleData['permissions'])->get();
            $role->permissions()->attach($permissions);
        }

        return [
            'success' => true,
            'message' => 'Role created successfully',
            'role' => [
                'name' => $role->name,
                'display_name' => $role->display_name,
                'description' => $role->description,
                'permissions' => $role->permissions->pluck('name')->toArray(),
            ],
        ];
    }
}
