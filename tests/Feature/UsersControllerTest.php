<?php

use App\Models\Tenant;
use App\Models\TenantUser;
use App\Models\User;
use App\Services\UserService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('can display users index page', function () {
    // Mock the UserService
    $this->mock(UserService::class, function ($mock) {
        $mock->shouldReceive('getUsersForIndex')->once()->andReturn(collect([]));
        $mock->shouldReceive('getInvitationsForIndex')->once()->andReturn(collect([]));
        $mock->shouldReceive('getAvailableRoles')->once()->andReturn(collect([]));
    });

    $user = User::factory()->create();
    $tenant = Tenant::create(['id' => 'test-tenant-123']);

    TenantUser::create([
        'tenant_id' => $tenant->id,
        'user_id' => $user->id,
        'role' => 'admin',
    ]);

    $response = $this->actingAs($user)
        ->get("/t/{$tenant->id}/users");

    $response->assertStatus(200);
});

it('can display users create page', function () {
    // Mock the UserService
    $this->mock(UserService::class, function ($mock) {
        $mock->shouldReceive('getAvailableRoles')->once()->andReturn(collect([]));
    });

    $user = User::factory()->create();
    $tenant = Tenant::create(['id' => 'test-tenant-123']);

    TenantUser::create([
        'tenant_id' => $tenant->id,
        'user_id' => $user->id,
        'role' => 'admin',
    ]);

    $response = $this->actingAs($user)
        ->get("/t/{$tenant->id}/users/create");

    $response->assertStatus(200);
});
