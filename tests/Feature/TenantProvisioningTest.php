<?php

use App\Models\TenantPermission;
use App\Models\TenantRole;
use App\Models\User;
use App\Services\TenantProvisioningService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\Tenant;

uses(RefreshDatabase::class);

it('creates a tenant with default roles and permissions', function () {
    $user = User::factory()->create([
        'name' => 'John Doe',
        'email' => 'john@example.com',
    ]);

    $service = new TenantProvisioningService();
    $tenant = $service->createTenantForUser($user, 'test-tenant');

    expect($tenant)->toBeInstanceOf(Tenant::class);
    expect($tenant->id)->toBe('test-tenant');

    // Initialize tenancy to check tenant-specific data
    tenancy()->initialize($tenant);

    // Check that default roles were created
    expect(TenantRole::count())->toBe(3);
    expect(TenantRole::pluck('name')->toArray())->toEqual(['owner', 'admin', 'member']);

            // Check that default permissions were created
        expect(TenantPermission::count())->toBe(8);
        $expectedPermissions = [
            'view_dashboard', 
            'manage_users', 
            'manage_roles', 
            'view_analytics', 
            'manage_settings',
            'grant_roles',
            'revoke_roles',
            'manage_owner_roles'
        ];
        expect(TenantPermission::pluck('name')->toArray())->toEqual($expectedPermissions);

    // Check that user was assigned owner role
    expect($user->hasRole('owner'))->toBeTrue();

    tenancy()->end();
});

it('assigns correct permissions to roles', function () {
    $user = User::factory()->create();
    
    $service = new TenantProvisioningService();
    $tenant = $service->createTenantForUser($user, 'permissions-test');

    tenancy()->initialize($tenant);

    $ownerRole = TenantRole::where('name', 'owner')->first();
    $adminRole = TenantRole::where('name', 'admin')->first();
    $memberRole = TenantRole::where('name', 'member')->first();

            // Check owner permissions (should have all)
        expect($ownerRole->permissions->count())->toBe(8);
        expect($ownerRole->hasPermissionTo('manage_roles'))->toBeTrue();
        expect($ownerRole->hasPermissionTo('manage_settings'))->toBeTrue();
        expect($ownerRole->hasPermissionTo('grant_roles'))->toBeTrue();
        expect($ownerRole->hasPermissionTo('revoke_roles'))->toBeTrue();
        expect($ownerRole->hasPermissionTo('manage_owner_roles'))->toBeTrue();

            // Check admin permissions
        expect($adminRole->permissions->count())->toBe(6);
        expect($adminRole->hasPermissionTo('manage_users'))->toBeTrue();
        expect($adminRole->hasPermissionTo('manage_settings'))->toBeTrue();
        expect($adminRole->hasPermissionTo('manage_roles'))->toBeFalse();
        expect($adminRole->hasPermissionTo('grant_roles'))->toBeTrue();
        expect($adminRole->hasPermissionTo('revoke_roles'))->toBeTrue();
        expect($adminRole->hasPermissionTo('manage_owner_roles'))->toBeFalse();

    // Check member permissions
    expect($memberRole->permissions->count())->toBe(2);
    expect($memberRole->hasPermissionTo('view_dashboard'))->toBeTrue();
    expect($memberRole->hasPermissionTo('view_analytics'))->toBeTrue();
    expect($memberRole->hasPermissionTo('manage_users'))->toBeFalse();

    tenancy()->end();
});

it('grants roles to users successfully', function () {
    $owner = User::factory()->create();
    $newUser = User::factory()->create();
    
    $service = new TenantProvisioningService();
    $tenant = $service->createTenantForUser($owner, 'role-grant-test');

    tenancy()->initialize($tenant);

    $result = $service->grantRoleToUser($newUser, 'admin');

    expect($result)->toBeTrue();
    expect($newUser->hasRole('admin'))->toBeTrue();

    tenancy()->end();
});

it('removes roles from users successfully', function () {
    $owner = User::factory()->create();
    $user = User::factory()->create();
    
    $service = new TenantProvisioningService();
    $tenant = $service->createTenantForUser($owner, 'role-remove-test');

    tenancy()->initialize($tenant);

    // Grant and then remove role
    $service->grantRoleToUser($user, 'admin');
    expect($user->hasRole('admin'))->toBeTrue();

    $result = $service->removeRoleFromUser($user, 'admin');

    expect($result)->toBeTrue();
    expect($user->hasRole('admin'))->toBeFalse();

    tenancy()->end();
});

it('returns false when granting non-existent role', function () {
    $owner = User::factory()->create();
    $user = User::factory()->create();
    
    $service = new TenantProvisioningService();
    $tenant = $service->createTenantForUser($owner, 'invalid-role-test');

    tenancy()->initialize($tenant);

    $result = $service->grantRoleToUser($user, 'non-existent-role');

    expect($result)->toBeFalse();

    tenancy()->end();
});

it('gets users with roles correctly', function () {
    $owner = User::factory()->create(['name' => 'Owner User']);
    $admin = User::factory()->create(['name' => 'Admin User']);
    $userWithoutRole = User::factory()->create(['name' => 'No Role User']);
    
    $service = new TenantProvisioningService();
    $tenant = $service->createTenantForUser($owner, 'users-roles-test');

    tenancy()->initialize($tenant);

    $service->grantRoleToUser($admin, 'admin');

    $usersWithRoles = $service->getUsersWithRoles();

    expect($usersWithRoles->count())->toBe(2); // Owner and admin
    expect($usersWithRoles->pluck('name'))->toContain('Owner User');
    expect($usersWithRoles->pluck('name'))->toContain('Admin User');
    expect($usersWithRoles->pluck('name'))->not->toContain('No Role User');

    tenancy()->end();
});

it('handles user registration and tenant creation', function () {
    $response = $this->post('/register', [
        'name' => 'John Doe',
        'email' => 'john@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'tenant_name' => 'johns-company',
    ]);

    $response->assertRedirect();
    
    $user = User::where('email', 'john@example.com')->first();
    expect($user)->not->toBeNull();
    expect($user->name)->toBe('John Doe');

    $tenant = Tenant::find('johns-company');
    expect($tenant)->not->toBeNull();

    // Check that user was assigned owner role in tenant
    tenancy()->initialize($tenant);
    expect($user->hasRole('owner'))->toBeTrue();
    tenancy()->end();
});