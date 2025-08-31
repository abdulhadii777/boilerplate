<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\TenantRole;
use App\Models\TenantPermission;
use Illuminate\Support\Facades\DB;

class TenantRolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create permissions with consistent can_{action}_{resource} naming
        $permissions = [
            'can_view_dashboard',
            'can_view_analytics',
            'can_manage_users',
            'can_invite_users',
            'can_remove_users',
            'can_manage_roles',
            'can_manage_permissions',
            'can_manage_settings',
        ];

        foreach ($permissions as $permission) {
            TenantPermission::firstOrCreate([
                'name' => $permission,
                'guard_name' => 'web',
            ]);
        }

        // Create roles with their permissions
        $roles = [
            'owner' => [
                'display_name' => 'Owner',
                'description' => 'Full access to all features and settings',
                'permissions' => $permissions, // All permissions
            ],
            'admin' => [
                'display_name' => 'Administrator',
                'description' => 'Can manage users, roles, and most settings',
                'permissions' => [
                    'can_view_dashboard',
                    'can_view_analytics',
                    'can_manage_users',
                    'can_invite_users',
                    'can_remove_users',
                    'can_manage_roles',
                    'can_manage_permissions',
                    'can_manage_settings',
                ],
            ],
            'manager' => [
                'display_name' => 'Manager',
                'description' => 'Can view users and analytics, limited management',
                'permissions' => [
                    'can_view_dashboard',
                    'can_view_analytics',
                    'can_manage_users',
                ],
            ],
            'member' => [
                'display_name' => 'Member',
                'description' => 'Basic access to dashboard and own profile',
                'permissions' => [
                    'can_view_dashboard',
                ],
            ],
            'viewer' => [
                'display_name' => 'Viewer',
                'description' => 'Read-only access to basic information',
                'permissions' => [
                    'can_view_dashboard',
                ],
            ],
        ];

        foreach ($roles as $roleName => $roleData) {
            $role = TenantRole::firstOrCreate([
                'name' => $roleName,
                'guard_name' => 'web',
            ], [
                'display_name' => $roleData['display_name'],
                'description' => $roleData['description'],
            ]);

            // Assign permissions to role
            $permissionIds = TenantPermission::whereIn('name', $roleData['permissions'])
                ->pluck('id')
                ->toArray();

            $role->permissions()->sync($permissionIds);
        }
    }
}
