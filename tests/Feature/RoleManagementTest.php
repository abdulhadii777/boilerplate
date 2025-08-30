<?php

use App\Models\TenantRole;
use App\Models\User;
use App\Services\TenantProvisioningService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\Tenant;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->owner = User::factory()->create();
    $this->admin = User::factory()->create();
    $this->member = User::factory()->create();
    $this->regularUser = User::factory()->create();

    $service = new TenantProvisioningService();
    $this->tenant = $service->createTenantForUser($this->owner, 'role-management-test');

    tenancy()->initialize($this->tenant);
    $service->grantRoleToUser($this->admin, 'admin');
    $service->grantRoleToUser($this->member, 'member');
    tenancy()->end();
});

afterEach(function () {
    if (tenancy()->initialized) {
        tenancy()->end();
    }
});

it('allows owner to access role management page', function () {
    $response = $this->actingAs($this->owner)
        ->get("/t/{$this->tenant->id}/roles");

    $response->assertOk();
    $response->assertInertia(function ($page) {
        $page->component('tenant/role-grant')
            ->has('users')
            ->has('availableRoles')
            ->has('permissions');
    });
});

it('allows admin to access role management page', function () {
    $response = $this->actingAs($this->admin)
        ->get("/t/{$this->tenant->id}/roles");

    $response->assertOk();
});

it('denies member access to role management page', function () {
    $response = $this->actingAs($this->member)
        ->get("/t/{$this->tenant->id}/roles");

    $response->assertForbidden();
});

it('denies access to user without roles in tenant', function () {
    $response = $this->actingAs($this->regularUser)
        ->get("/t/{$this->tenant->id}/roles");

    $response->assertForbidden();
});

it('allows owner to grant admin role', function () {
    $newUser = User::factory()->create(['email' => 'newuser@example.com']);

    $response = $this->actingAs($this->owner)
        ->post("/t/{$this->tenant->id}/roles/grant", [
            'email' => 'newuser@example.com',
            'role' => 'admin',
        ]);

    $response->assertRedirect();
    $response->assertSessionHas('success');

    tenancy()->initialize($this->tenant);
    expect($newUser->hasRole('admin'))->toBeTrue();
    tenancy()->end();
});

it('allows admin to grant member role but not owner role', function () {
    $newUser = User::factory()->create(['email' => 'member@example.com']);

    // Admin can grant member role
    $response = $this->actingAs($this->admin)
        ->post("/t/{$this->tenant->id}/roles/grant", [
            'email' => 'member@example.com',
            'role' => 'member',
        ]);

    $response->assertRedirect();
    $response->assertSessionHas('success');

    // Admin cannot grant owner role
    $ownerUser = User::factory()->create(['email' => 'owner@example.com']);
    
    $response = $this->actingAs($this->admin)
        ->post("/t/{$this->tenant->id}/roles/grant", [
            'email' => 'owner@example.com',
            'role' => 'owner',
        ]);

    $response->assertRedirect();
    $response->assertSessionHasErrors('role');
});

it('prevents granting role to non-existent user', function () {
    $response = $this->actingAs($this->owner)
        ->post("/t/{$this->tenant->id}/roles/grant", [
            'email' => 'nonexistent@example.com',
            'role' => 'admin',
        ]);

    $response->assertRedirect();
    $response->assertSessionHasErrors('email');
});

it('validates role input when granting', function () {
    $newUser = User::factory()->create(['email' => 'test@example.com']);

    $response = $this->actingAs($this->owner)
        ->post("/t/{$this->tenant->id}/roles/grant", [
            'email' => 'test@example.com',
            'role' => 'invalid-role',
        ]);

    $response->assertRedirect();
    $response->assertSessionHasErrors('role');
});

it('allows owner to revoke admin role', function () {
    $response = $this->actingAs($this->owner)
        ->delete("/t/{$this->tenant->id}/roles/revoke", [
            'user_id' => $this->admin->id,
            'role' => 'admin',
        ]);

    $response->assertRedirect();
    $response->assertSessionHas('success');

    tenancy()->initialize($this->tenant);
    expect($this->admin->hasRole('admin'))->toBeFalse();
    tenancy()->end();
});

it('prevents owner from revoking their own owner role', function () {
    $response = $this->actingAs($this->owner)
        ->delete("/t/{$this->tenant->id}/roles/revoke", [
            'user_id' => $this->owner->id,
            'role' => 'owner',
        ]);

    $response->assertRedirect();
    $response->assertSessionHasErrors('role');

    tenancy()->initialize($this->tenant);
    expect($this->owner->hasRole('owner'))->toBeTrue();
    tenancy()->end();
});

it('prevents admin from revoking owner role from others', function () {
    $response = $this->actingAs($this->admin)
        ->delete("/t/{$this->tenant->id}/roles/revoke", [
            'user_id' => $this->owner->id,
            'role' => 'owner',
        ]);

    $response->assertRedirect();
    $response->assertSessionHasErrors('role');

    tenancy()->initialize($this->tenant);
    expect($this->owner->hasRole('owner'))->toBeTrue();
    tenancy()->end();
});

it('shows correct permission flags in role management page', function () {
    $response = $this->actingAs($this->owner)
        ->get("/t/{$this->tenant->id}/roles");

    $response->assertInertia(function ($page) {
        $page->has('permissions.can_grant', true)
            ->has('permissions.can_revoke', true)
            ->has('permissions.can_manage_owner', true);
    });

    $response = $this->actingAs($this->admin)
        ->get("/t/{$this->tenant->id}/roles");

    $response->assertInertia(function ($page) {
        $page->has('permissions.can_grant', true)
            ->has('permissions.can_revoke', true)
            ->has('permissions.can_manage_owner', false);
    });
});

it('displays users with their roles correctly', function () {
    $response = $this->actingAs($this->owner)
        ->get("/t/{$this->tenant->id}/roles");

    $response->assertInertia(function ($page) {
        $page->has('users', 3) // owner, admin, member
            ->where('users.0.roles', ['owner'])
            ->where('users.1.roles', ['admin'])
            ->where('users.2.roles', ['member']);
    });
});

it('allows access to tenant dashboard for users with roles', function () {
    $response = $this->actingAs($this->owner)
        ->get("/t/{$this->tenant->id}/dashboard");

    $response->assertOk();

    $response = $this->actingAs($this->admin)
        ->get("/t/{$this->tenant->id}/dashboard");

    $response->assertOk();

    $response = $this->actingAs($this->member)
        ->get("/t/{$this->tenant->id}/dashboard");

    $response->assertOk();
});

it('denies access to tenant dashboard for users without roles', function () {
    $response = $this->actingAs($this->regularUser)
        ->get("/t/{$this->tenant->id}/dashboard");

    $response->assertForbidden();
});