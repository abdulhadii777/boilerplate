<?php

namespace App\Services;

use App\Models\TenantPermission;
use App\Models\TenantRole;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class PermissionService
{
    /**
     * Check if a user has a specific permission in a tenant context.
     */
    public function userHasPermission(int $userId, string $tenantId, string $permission): bool
    {
        $userRole = $this->getUserRole($userId, $tenantId);
        
        if (!$userRole) {
            return false;
        }

        return $this->roleHasPermission($userRole, $permission);
    }

    /**
     * Check if a role has a specific permission.
     */
    public function roleHasPermission(string $roleName, string $permission): bool
    {
        $role = TenantRole::where('name', $roleName)
            ->where('guard_name', 'web')
            ->first();

        if (!$role) {
            return false;
        }

        return $role->hasPermissionTo($permission);
    }

    /**
     * Get user's permissions for frontend as a simple boolean array.
     */
    public function getUserPermissionsForFrontend(int $userId, string $tenantId): array
    {
        $userRole = $this->getUserRole($userId, $tenantId);
        
        if (!$userRole) {
            return $this->getDefaultPermissions();
        }

        $rolePermissions = $this->getRolePermissions($userRole);
        $permissionNames = $rolePermissions->pluck('name')->toArray();

        // Simple boolean mapping for all possible permissions
        return [
            'can_view_dashboard' => in_array('can_view_dashboard', $permissionNames),
            'can_manage_users' => in_array('can_manage_users', $permissionNames),
            'can_invite_users' => in_array('can_invite_users', $permissionNames),
            'can_remove_users' => in_array('can_remove_users', $permissionNames),
            'can_manage_roles' => in_array('can_manage_roles', $permissionNames),
            'can_manage_settings' => in_array('can_manage_settings', $permissionNames),
            'can_view_analytics' => in_array('can_view_analytics', $permissionNames),
            'can_manage_permissions' => in_array('can_manage_permissions', $permissionNames),
        ];
    }

    /**
     * Get user's role in a tenant.
     */
    private function getUserRole(int $userId, string $tenantId): ?string
    {
        return DB::connection('mysql')
            ->table('tenant_users')
            ->where('user_id', $userId)
            ->where('tenant_id', $tenantId)
            ->value('role');
    }

    /**
     * Get all permissions for a specific role.
     */
    private function getRolePermissions(string $roleName): Collection
    {
        $role = TenantRole::where('name', $roleName)
            ->where('guard_name', 'web')
            ->first();

        if (!$role) {
            return collect();
        }

        return $role->permissions;
    }

    /**
     * Get default permissions (no access).
     */
    private function getDefaultPermissions(): array
    {
        return [
            'can_view_dashboard' => false,
            'can_manage_users' => false,
            'can_invite_users' => false,
            'can_remove_users' => false,
            'can_manage_roles' => false,
            'can_manage_settings' => false,
            'can_view_analytics' => false,
            'can_manage_permissions' => false,
        ];
    }
}
