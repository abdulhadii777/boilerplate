<?php

use App\Models\Invitation;
use App\Models\Tenant;
use App\Models\TenantRole;
use App\Models\TenantUser;
use App\Models\User;
use App\Services\UserService;

it('can get available roles', function () {
    // Create a test role
    $role = TenantRole::create([
        'name' => 'test_role',
        'display_name' => 'Test Role',
        'description' => 'A test role',
        'guard_name' => 'web',
    ]);

    $service = new UserService;
    $roles = $service->getAvailableRoles();

    expect($roles)->toHaveCount(1);
    expect($roles->first()->name)->toBe('test_role');
    expect($roles->first()->display_name)->toBe('Test Role');
});

it('can get users for index', function () {
    // Create a test tenant and user
    $tenant = Tenant::create(['id' => 'test-tenant-123']);
    $user = User::create([
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => bcrypt('password'),
    ]);

    $tenantUser = TenantUser::create([
        'tenant_id' => $tenant->id,
        'user_id' => $user->id,
        'role' => 'member',
    ]);

    $service = new UserService;
    $users = $service->getUsersForIndex($tenant->id);

    expect($users)->toHaveCount(1);
    expect($users->first()->user->name)->toBe('Test User');
});

it('can get invitations for index', function () {
    // Create a test tenant and invitation
    $tenant = Tenant::create(['id' => 'test-tenant-456']);

    $invitation = Invitation::create([
        'tenant_id' => $tenant->id,
        'email' => 'invite@example.com',
        'role' => 'member',
        'status' => 'pending',
        'token' => 'test-token',
        'expires_at' => now()->addDays(7),
    ]);

    $service = new UserService;
    $invitations = $service->getInvitationsForIndex($tenant->id);

    expect($invitations)->toHaveCount(1);
    expect($invitations->first()->email)->toBe('invite@example.com');
    expect($invitations->first()->status)->toBe('pending');
});
