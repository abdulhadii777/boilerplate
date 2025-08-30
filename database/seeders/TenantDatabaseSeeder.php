<?php

namespace Database\Seeders;

use App\Models\TenantPermission;
use App\Models\TenantRole;
use Illuminate\Database\Seeder;

class TenantDatabaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create permissions
        $permissions = [
            'view_dashboard' => 'View dashboard and basic information',
            'manage_users' => 'Add, edit, and remove organization users',
            'manage_roles' => 'Grant and revoke user roles',
            'view_analytics' => 'Access analytics and reporting features',
            'manage_settings' => 'Modify organization settings',
            'grant_roles' => 'Grant roles to users',
            'revoke_roles' => 'Revoke roles from users',
            'manage_owner_roles' => 'Manage owner role assignments',
        ];

        foreach ($permissions as $name => $description) {
            TenantPermission::firstOrCreate([
                'name' => $name,
                'guard_name' => 'web',
            ]);
        }

        // Create roles with permissions
        $rolesData = [
            'owner' => [
                'permissions' => [
                    'view_dashboard', 
                    'manage_users', 
                    'manage_roles', 
                    'view_analytics', 
                    'manage_settings',
                    'grant_roles',
                    'revoke_roles',
                    'manage_owner_roles'
                ],
                'description' => 'Full access to all organization features and settings',
            ],
            'admin' => [
                'permissions' => [
                    'view_dashboard', 
                    'manage_users', 
                    'view_analytics', 
                    'manage_settings',
                    'grant_roles',
                    'revoke_roles'
                ],
                'description' => 'Manage users and view analytics, can grant/revoke roles but cannot manage owner roles',
            ],
            'member' => [
                'permissions' => [
                    'view_dashboard', 
                    'view_analytics'
                ],
                'description' => 'Basic access to dashboard and analytics',
            ],
        ];

        foreach ($rolesData as $roleName => $roleData) {
            $role = TenantRole::firstOrCreate([
                'name' => $roleName,
                'guard_name' => 'web',
            ]);

            // Assign permissions to role
            $permissions = TenantPermission::whereIn('name', $roleData['permissions'])->get();
            $role->syncPermissions($permissions);
        }
    }
}