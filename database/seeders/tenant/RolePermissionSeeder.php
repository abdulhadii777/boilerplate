<?php

namespace Database\Seeders\Tenant;

use App\Models\Role;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        $guard_name = 'tenant';

        // Create permissions with proper title case
        $permissions = [
            'View Role',
            'Modify Roles',
            'View User',
            'Invite User',
            'Manage User',
            'View Activity Log',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => $guard_name]);
        }

        // Create admin role with all permissions
        $adminRole = Role::firstOrCreate(['name' => 'Admin', 'guard_name' => $guard_name]);
        $adminRole->update(['is_system' => true]);
        $adminRole->givePermissionTo($permissions);

        // Create manager role with view and modify permissions
        $managerRole = Role::firstOrCreate(['name' => 'Manager', 'guard_name' => $guard_name]);
        $managerRole->givePermissionTo([
            'View Role',
            'View User',
            'Manage User',
            'View Activity Log',
        ]);

        // Create user role with basic permissions
        $userRole = Role::firstOrCreate(['name' => 'User', 'guard_name' => $guard_name]);
        $userRole->givePermissionTo([
            'View User',
        ]);

        // Create moderator role - can only view invited users
        $moderatorRole = Role::firstOrCreate(['name' => 'Moderator', 'guard_name' => $guard_name]);
        $moderatorRole->givePermissionTo([
            'View User',
        ]);
    }
}
