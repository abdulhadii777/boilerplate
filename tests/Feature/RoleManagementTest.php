<?php

namespace Tests\Feature;

use App\Models\CentralUser;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class RoleManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Create permissions
        $permissions = [
            'View Role', 'Create Role', 'Edit Role', 'Delete Role', 'Modify Roles',
            'View User', 'Create User', 'Edit User', 'Delete User',
        ];

        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }
    }

    public function test_admin_can_view_roles_page(): void
    {
        $admin = CentralUser::factory()->create();
        $adminRole = Role::create(['name' => 'Admin']);
        $adminRole->givePermissionTo(['View Role', 'Modify Roles']);
        $admin->assignRole($adminRole);

        $response = $this->actingAs($admin)->get('/roles');

        $response->assertInertia(fn ($page) => $page->component('Roles/Index')
            ->has('roles')
            ->has('permissions')
        );
    }

    public function test_user_without_permission_cannot_access_roles(): void
    {
        $user = CentralUser::factory()->create();

        $response = $this->actingAs($user)->get('/roles');

        $response->assertForbidden();
    }

    public function test_admin_can_create_role(): void
    {
        $admin = CentralUser::factory()->create();
        $adminRole = Role::create(['name' => 'Admin']);
        $adminRole->givePermissionTo(['View Role', 'Modify Roles']);
        $admin->assignRole($adminRole);

        $roleData = [
            'name' => 'Test Role',
            'description' => 'Test Description',
            'permissions' => ['View User', 'Edit User'],
        ];

        $response = $this->actingAs($admin)->post('/roles', $roleData);

        $response->assertRedirect();
        $this->assertDatabaseHas('roles', [
            'name' => 'Test Role',
            'description' => 'Test Description',
        ]);
    }

    public function test_role_name_must_be_unique(): void
    {
        $admin = CentralUser::factory()->create();
        $adminRole = Role::create(['name' => 'Admin']);
        $adminRole->givePermissionTo(['View Role', 'Modify Roles']);
        $admin->assignRole($adminRole);

        // Create first role
        Role::create(['name' => 'Test Role']);

        // Try to create duplicate
        $roleData = [
            'name' => 'Test Role',
            'permissions' => ['View User'],
        ];

        $response = $this->actingAs($admin)->post('/roles', $roleData);

        $response->assertSessionHasErrors('name');
    }

    public function test_role_must_have_at_least_one_permission(): void
    {
        $admin = CentralUser::factory()->create();
        $adminRole = Role::create(['name' => 'Admin']);
        $adminRole->givePermissionTo(['View Role', 'Modify Roles']);
        $admin->assignRole($adminRole);

        $roleData = [
            'name' => 'Test Role',
            'permissions' => [],
        ];

        $response = $this->actingAs($admin)->post('/roles', $roleData);

        $response->assertSessionHasErrors('permissions');
    }

    public function test_admin_can_copy_role(): void
    {
        $admin = CentralUser::factory()->create();
        $adminRole = Role::create(['name' => 'Admin']);
        $adminRole->givePermissionTo(['View Role', 'Modify Roles']);
        $admin->assignRole($adminRole);

        $originalRole = Role::create(['name' => 'Original Role']);
        $originalRole->givePermissionTo(['View User']);

        $response = $this->actingAs($admin)->post("/roles/{$originalRole->id}/copy");

        $response->assertRedirect();
        $this->assertDatabaseHas('roles', [
            'name' => 'Original Role (Copy)',
        ]);
    }
}
