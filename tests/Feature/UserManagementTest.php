<?php

use App\Models\Invite;
use App\Models\Role;
use App\Models\CentralUser;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class UserManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Create permissions that match exactly with the seeder
        $permissions = [
            'View Role',
            'Modify Roles',
            'View User',
            'Invite User',
            'Manage User',
        ];

        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }
    }

    // ==================== USERS INDEX ROUTE ====================

    public function test_admin_can_view_users_page(): void
    {
        $admin = CentralUser::factory()->create();
        $adminRole = Role::create(['name' => 'Admin']);
        $adminRole->givePermissionTo(['View User']);
        $admin->assignRole($adminRole);

        $response = $this->actingAs($admin)->get('/users');

        $response->assertInertia(fn ($page) => $page->component('Users/Index')
            ->has('users')
            ->has('roles')
            ->has('invites')
            ->has('totalUsers')
            ->has('totalInvites')
        );
    }

    public function test_user_without_permission_cannot_access_users(): void
    {
        $user = CentralUser::factory()->create();

        $response = $this->actingAs($user)->get('/users');

        $response->assertForbidden();
    }

    public function test_unauthenticated_user_cannot_access_users(): void
    {
        $response = $this->get('/users');

        $response->assertRedirect('/login');
    }

    // ==================== UPDATE USER ROLE ROUTE ====================

    public function test_admin_can_update_user_role(): void
    {
        $admin = CentralUser::factory()->create();
        $adminRole = Role::create(['name' => 'Admin']);
        $adminRole->givePermissionTo(['Assign Role']);
        $admin->assignRole($adminRole);

        $user = CentralUser::factory()->create();
        $newRole = Role::create(['name' => 'Moderator']);

        $response = $this->actingAs($admin)->put("/users/{$user->id}/role", [
            'role_id' => $newRole->id,
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $user->refresh();
        $this->assertTrue($user->hasRole('Moderator'));
    }

    public function test_user_without_permission_cannot_update_user_role(): void
    {
        $user = CentralUser::factory()->create();
        $targetUser = CentralUser::factory()->create();
        $role = Role::create(['name' => 'Moderator']);

        $response = $this->actingAs($user)->put("/users/{$targetUser->id}/role", [
            'role_id' => $role->id,
        ]);

        $response->assertForbidden();
    }

    public function test_update_user_role_validation_requires_role_id(): void
    {
        $admin = CentralUser::factory()->create();
        $adminRole = Role::create(['name' => 'Admin']);
        $adminRole->givePermissionTo(['Assign Role']);
        $admin->assignRole($adminRole);

        $user = CentralUser::factory()->create();

        $response = $this->actingAs($admin)->put("/users/{$user->id}/role", []);

        $response->assertSessionHasErrors(['role_id']);
    }

    public function test_update_user_role_validation_requires_valid_role(): void
    {
        $admin = CentralUser::factory()->create();
        $adminRole = Role::create(['name' => 'Admin']);
        $adminRole->givePermissionTo(['Assign Role']);
        $admin->assignRole($adminRole);

        $user = CentralUser::factory()->create();

        $response = $this->actingAs($admin)->put("/users/{$user->id}/role", [
            'role_id' => 999, // Non-existent role ID
        ]);

        $response->assertSessionHasErrors(['role_id']);
    }

    // ==================== DISABLE USER ROUTE ====================

    public function test_admin_can_disable_user(): void
    {
        $admin = CentralUser::factory()->create();
        $adminRole = Role::create(['name' => 'Admin']);
        $adminRole->givePermissionTo(['Delete User']); // Using Delete User permission as per policy
        $admin->assignRole($adminRole);

        $user = CentralUser::factory()->create();

        $response = $this->actingAs($admin)->put("/users/{$user->id}/disable");

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $user->refresh();
        $this->assertSoftDeleted($user);
        $this->assertEquals('inactive', $user->status);
    }

    public function test_user_without_permission_cannot_disable_user(): void
    {
        $user = CentralUser::factory()->create();
        $targetUser = CentralUser::factory()->create();

        $response = $this->actingAs($user)->put("/users/{$targetUser->id}/disable");

        $response->assertForbidden();
    }

    public function test_user_cannot_disable_themselves(): void
    {
        $admin = CentralUser::factory()->create();
        $adminRole = Role::create(['name' => 'Admin']);
        $adminRole->givePermissionTo(['Delete User']);
        $admin->assignRole($adminRole);

        $response = $this->actingAs($admin)->put("/users/{$admin->id}/disable");

        $response->assertForbidden();
    }

    // ==================== ENABLE USER ROUTE ====================

    public function test_admin_can_enable_user(): void
    {
        $admin = CentralUser::factory()->create();
        $adminRole = Role::create(['name' => 'Admin']);
        $adminRole->givePermissionTo(['Disable User']); // Using Disable User permission as per policy
        $admin->assignRole($adminRole);

        $user = CentralUser::factory()->create();
        $user->delete(); // Soft delete the user

        $response = $this->actingAs($admin)->put("/users/{$user->id}/enable");

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $user->refresh();
        $this->assertNotSoftDeleted($user);
        $this->assertEquals('active', $user->status);
    }

    public function test_user_without_permission_cannot_enable_user(): void
    {
        $user = CentralUser::factory()->create();
        $targetUser = CentralUser::factory()->create();
        $targetUser->delete(); // Soft delete the user

        $response = $this->actingAs($user)->put("/users/{$targetUser->id}/enable");

        $response->assertForbidden();
    }

    public function test_enable_nonexistent_user_returns_404(): void
    {
        $admin = CentralUser::factory()->create();
        $adminRole = Role::create(['name' => 'Admin']);
        $adminRole->givePermissionTo(['Delete User']);
        $admin->assignRole($adminRole);

        $response = $this->actingAs($admin)->put('/users/999/enable');

        $response->assertNotFound();
    }

    // ==================== DELETE USER ROUTE ====================

    public function test_admin_can_permanently_delete_user(): void
    {
        $admin = CentralUser::factory()->create();
        $adminRole = Role::create(['name' => 'Admin']);
        $adminRole->givePermissionTo(['Delete User']);
        $admin->assignRole($adminRole);

        $user = CentralUser::factory()->create();

        $response = $this->actingAs($admin)->delete("/users/{$user->id}");

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertDatabaseMissing('users', ['id' => $user->id]);
    }

    public function test_user_without_permission_cannot_delete_user(): void
    {
        $user = CentralUser::factory()->create();
        $targetUser = CentralUser::factory()->create();

        $response = $this->actingAs($user)->delete("/users/{$targetUser->id}");

        $response->assertForbidden();
    }

    public function test_user_can_delete_themselves(): void
    {
        $admin = CentralUser::factory()->create();
        $adminRole = Role::create(['name' => 'Admin']);
        $adminRole->givePermissionTo(['Delete User']);
        $admin->assignRole($adminRole);

        $response = $this->actingAs($admin)->delete("/users/{$admin->id}");

        $response->assertRedirect();
        $response->assertSessionHas('success');
    }

    // ==================== INVITE USER ROUTE ====================

    public function test_admin_can_invite_users(): void
    {
        $admin = CentralUser::factory()->create();
        $adminRole = Role::create(['name' => 'Admin']);
        $adminRole->givePermissionTo(['Invite User']);
        $admin->assignRole($adminRole);

        $role = Role::create(['name' => 'User']);

        $response = $this->actingAs($admin)->post('/users/invite', [
            'emails' => 'test@example.com, another@example.com',
            'role_id' => $role->id,
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('invites', [
            'email' => 'test@example.com',
            'role_id' => $role->id,
        ]);

        $this->assertDatabaseHas('invites', [
            'email' => 'another@example.com',
            'role_id' => $role->id,
        ]);
    }

    public function test_user_without_permission_cannot_invite_users(): void
    {
        $user = CentralUser::factory()->create();
        $role = Role::create(['name' => 'User']);

        $response = $this->actingAs($user)->post('/users/invite', [
            'emails' => 'test@example.com',
            'role_id' => $role->id,
        ]);

        $response->assertForbidden();
    }

    public function test_invite_validation_requires_emails(): void
    {
        $admin = CentralUser::factory()->create();
        $adminRole = Role::create(['name' => 'Admin']);
        $adminRole->givePermissionTo(['Invite User']);
        $admin->assignRole($adminRole);

        $role = Role::create(['name' => 'User']);

        $response = $this->actingAs($admin)->post('/users/invite', [
            'role_id' => $role->id,
        ]);

        $response->assertSessionHasErrors(['emails']);
    }

    public function test_invite_validation_requires_valid_emails(): void
    {
        $admin = CentralUser::factory()->create();
        $adminRole = Role::create(['name' => 'Admin']);
        $adminRole->givePermissionTo(['Invite User']);
        $admin->assignRole($adminRole);

        $role = Role::create(['name' => 'User']);

        $response = $this->actingAs($admin)->post('/users/invite', [
            'emails' => 'invalid-email, another@example.com',
            'role_id' => $role->id,
        ]);

        $response->assertSessionHasErrors(['emails']);
    }

    public function test_invite_validation_requires_role_id(): void
    {
        $admin = CentralUser::factory()->create();
        $adminRole = Role::create(['name' => 'Admin']);
        $adminRole->givePermissionTo(['Invite User']);
        $admin->assignRole($adminRole);

        $response = $this->actingAs($admin)->post('/users/invite', [
            'emails' => 'test@example.com',
        ]);

        $response->assertSessionHasErrors(['role_id']);
    }

    // ==================== RESEND INVITE ROUTE ====================

    public function test_admin_can_resend_invite(): void
    {
        $admin = CentralUser::factory()->create();
        $adminRole = Role::create(['name' => 'Admin']);
        $adminRole->givePermissionTo(['Invite User']); // Using Invite User permission as per policy
        $admin->assignRole($adminRole);

        $role = Role::create(['name' => 'User']);
        $invite = Invite::create([
            'email' => 'test@example.com',
            'role_id' => $role->id,
            'token' => 'test-token',
            'status' => 'pending',
            'expires_at' => now()->addDays(7),
        ]);

        $response = $this->actingAs($admin)->post("/invites/{$invite->id}/resend");

        $response->assertRedirect();
        $response->assertSessionHas('success');
    }

    public function test_user_without_permission_cannot_resend_invite(): void
    {
        $user = CentralUser::factory()->create();
        $role = Role::create(['name' => 'User']);
        $invite = Invite::create([
            'email' => 'test@example.com',
            'role_id' => $role->id,
            'token' => 'test-token',
            'status' => 'pending',
            'expires_at' => now()->addDays(7),
        ]);

        $response = $this->actingAs($user)->post("/invites/{$invite->id}/resend");

        $response->assertForbidden();
    }

    public function test_cannot_resend_expired_invite(): void
    {
        $admin = CentralUser::factory()->create();
        $adminRole = Role::create(['name' => 'Admin']);
        $adminRole->givePermissionTo(['Invite User']);
        $admin->assignRole($adminRole);

        $role = Role::create(['name' => 'User']);
        $invite = Invite::create([
            'email' => 'test@example.com',
            'role_id' => $role->id,
            'token' => 'test-token',
            'status' => 'pending',
            'expires_at' => now()->subDays(1), // Expired
        ]);

        $response = $this->actingAs($admin)->post("/invites/{$invite->id}/resend");

        $response->assertRedirect();
        $response->assertSessionHas('error');
    }

    // ==================== CANCEL INVITE ROUTE ====================

    public function test_admin_can_cancel_invite(): void
    {
        $admin = CentralUser::factory()->create();
        $admin->assignRole('Admin');

        $role = Role::create(['name' => 'User']);
        $invite = Invite::create([
            'email' => 'test@example.com',
            'role_id' => $role->id,
            'token' => 'test-token',
        ]);

        $response = $this->actingAs($admin)->post("/invites/{$invite->id}/cancel");

        $response->assertRedirect();
        $response->assertSessionHas('success');

        // Check that the invite was deleted
        $this->assertDatabaseMissing('invites', ['id' => $invite->id]);
    }

    public function test_user_without_permission_cannot_cancel_invite(): void
    {
        $user = CentralUser::factory()->create();
        $role = Role::create(['name' => 'User']);
        $invite = Invite::create([
            'email' => 'test@example.com',
            'role_id' => $role->id,
            'token' => 'test-token',
            'status' => 'pending',
            'expires_at' => now()->addDays(7),
        ]);

        $response = $this->actingAs($user)->delete("/invites/{$invite->id}");

        $response->assertForbidden();
    }

    // ==================== INVITE ACCEPTANCE ROUTES ====================

    public function test_public_can_view_invite_acceptance_page(): void
    {
        $role = Role::create(['name' => 'User']);
        $invite = Invite::create([
            'email' => 'test@example.com',
            'role_id' => $role->id,
            'token' => 'test-token',
            'status' => 'pending',
            'expires_at' => now()->addDays(7),
        ]);

        $response = $this->get("/invites/accept/{$invite->token}");

        $response->assertInertia(fn ($page) => $page->component('Users/InviteAcceptance')
            ->has('invite')
            ->has('token')
        );
    }

    public function test_invite_acceptance_page_returns_404_for_invalid_token(): void
    {
        $response = $this->get('/invites/accept/invalid-token');

        $response->assertNotFound();
    }

    public function test_invite_acceptance_page_returns_404_for_expired_token(): void
    {
        $role = Role::create(['name' => 'User']);
        $invite = Invite::create([
            'email' => 'test@example.com',
            'role_id' => $role->id,
            'token' => 'test-token',
            'expires_at' => now()->subDays(1), // Expired
        ]);

        $response = $this->get("/invites/accept/{$invite->token}");

        $response->assertNotFound();
    }

    public function test_public_can_accept_invite(): void
    {
        $role = Role::create(['name' => 'User']);
        $invite = Invite::create([
            'email' => 'test@example.com',
            'role_id' => $role->id,
            'token' => 'test-token',
            'expires_at' => now()->addDays(7),
        ]);

        $response = $this->post('/invites/accept', [
            'token' => $invite->token,
            'name' => 'John Doe',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertRedirect('/dashboard');
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('users', [
            'email' => 'test@example.com',
            'name' => 'John Doe',
        ]);

        $invite->refresh();
        $this->assertNotNull($invite->accepted_at);
    }

    public function test_accept_invite_validation_requires_name(): void
    {
        $role = Role::create(['name' => 'User']);
        $invite = Invite::create([
            'email' => 'test@example.com',
            'role_id' => $role->id,
            'token' => 'test-token',
            'status' => 'pending',
            'expires_at' => now()->addDays(7),
        ]);

        $response = $this->post('/invites/accept', [
            'token' => $invite->token,
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertSessionHasErrors(['name']);
    }

    public function test_accept_invite_validation_requires_password(): void
    {
        $role = Role::create(['name' => 'User']);
        $invite = Invite::create([
            'email' => 'test@example.com',
            'role_id' => $role->id,
            'token' => 'test-token',
            'status' => 'pending',
            'expires_at' => now()->addDays(7),
        ]);

        $response = $this->post('/invites/accept', [
            'token' => $invite->token,
            'name' => 'John Doe',
        ]);

        $response->assertSessionHasErrors(['password']);
    }

    public function test_accept_invite_validation_requires_password_confirmation(): void
    {
        $role = Role::create(['name' => 'User']);
        $invite = Invite::create([
            'email' => 'test@example.com',
            'role_id' => $role->id,
            'token' => 'test-token',
            'status' => 'pending',
            'expires_at' => now()->addDays(7),
        ]);

        $response = $this->post('/invites/accept', [
            'token' => $invite->token,
            'name' => 'John Doe',
            'password' => 'password123',
            'password_confirmation' => 'different-password',
        ]);

        $response->assertSessionHasErrors(['password']);
    }

    // ==================== EDGE CASES ====================

    public function test_users_page_shows_soft_deleted_users(): void
    {
        $admin = CentralUser::factory()->create();
        $adminRole = Role::create(['name' => 'Admin']);
        $adminRole->givePermissionTo(['View User']);
        $admin->assignRole($adminRole);

        $user = CentralUser::factory()->create();
        $user->delete(); // Soft delete

        $response = $this->actingAs($admin)->get('/users');

        $response->assertInertia(fn ($page) => $page->component('Users/Index')
            ->has('users', 2) // admin + soft deleted user
            ->where('users.1.status', 'inactive')
            ->has('totalUsers')
            ->has('totalInvites')
        );
    }

    public function test_users_page_shows_pending_invites(): void
    {
        $admin = CentralUser::factory()->create();
        $adminRole = Role::create(['name' => 'Admin']);
        $adminRole->givePermissionTo(['View User']);
        $admin->assignRole($adminRole);

        $role = Role::create(['name' => 'User']);
        $invite = Invite::create([
            'email' => 'invited@example.com',
            'role_id' => $role->id,
            'token' => 'test-token',
            'status' => 'pending',
            'expires_at' => now()->addDays(7),
        ]);

        $response = $this->actingAs($admin)->get('/users');

        $response->assertInertia(fn ($page) => $page->component('Users/Index')
            ->has('invites', 1)
            ->where('invites.0.email', 'invited@example.com')
            ->has('totalUsers')
            ->has('totalInvites')
        );
    }

    // Add test for delete invite functionality
    public function test_admin_can_delete_invite(): void
    {
        $admin = CentralUser::factory()->create();
        $admin->assignRole('Admin');

        $role = Role::create(['name' => 'User']);
        $invite = Invite::create([
            'email' => 'test@example.com',
            'role_id' => $role->id,
            'token' => 'test-token',
        ]);

        $response = $this->actingAs($admin)->delete("/invites/{$invite->id}");

        $response->assertRedirect();
        $response->assertSessionHas('success');

        // Check that the invite was deleted
        $this->assertDatabaseMissing('invites', ['id' => $invite->id]);
    }

    public function test_user_without_permission_cannot_delete_invite(): void
    {
        $user = CentralUser::factory()->create();
        $role = Role::create(['name' => 'User']);
        $invite = Invite::create([
            'email' => 'test@example.com',
            'role_id' => $role->id,
            'token' => 'test-token',
            'status' => 'pending',
            'expires_at' => now()->addDays(7),
        ]);

        $response = $this->actingAs($user)->delete("/invites/{$invite->id}");

        $response->assertForbidden();
    }
}
