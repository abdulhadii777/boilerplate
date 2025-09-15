<?php

use App\Models\ActivityLog;
use App\Models\TenantUser;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    $this->user = TenantUser::factory()->create();
    $this->adminRole = Role::firstOrCreate(['name' => 'Admin']);
    $this->user->assignRole($this->adminRole);

    // Create the permission if it doesn't exist
    Permission::firstOrCreate(['name' => 'View Activity Log']);
    $this->user->givePermissionTo('View Activity Log');
});

it('can view activity logs index page', function () {
    $this->actingAs($this->user)
        ->get('/activity-logs')
        ->assertSuccessful();
});

it('can filter activity logs by feature', function () {
    // Create some test activity logs
    ActivityLog::create([
        'feature' => 'User',
        'action' => 'Create User',
        'details' => 'Test user created',
        'performed_by' => $this->user->id,
        'performed_at' => now(),
    ]);

    ActivityLog::create([
        'feature' => 'Role',
        'action' => 'Create Role',
        'details' => 'Test role created',
        'performed_by' => $this->user->id,
        'performed_at' => now(),
    ]);

    $this->actingAs($this->user)
        ->get('/activity-logs?feature=User')
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->component('ActivityLogs/Index')
            ->has('logs.data', 1)
            ->where('logs.data.0.feature', 'User')
        );
});

it('can filter activity logs by action', function () {
    // Create some test activity logs
    ActivityLog::create([
        'feature' => 'User',
        'action' => 'Create User',
        'details' => 'Test user created',
        'performed_by' => $this->user->id,
        'performed_at' => now(),
    ]);

    ActivityLog::create([
        'feature' => 'User',
        'action' => 'Update User',
        'details' => 'Test user updated',
        'performed_by' => $this->user->id,
        'performed_at' => now(),
    ]);

    $this->actingAs($this->user)
        ->get('/activity-logs?action=Create User')
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->component('ActivityLogs/Index')
            ->has('logs.data', 1)
            ->where('logs.data.0.action', 'Create User')
        );
});

it('can search activity logs', function () {
    // Create some test activity logs
    ActivityLog::create([
        'feature' => 'User',
        'action' => 'Create User',
        'details' => 'John Doe created',
        'performed_by' => $this->user->id,
        'performed_at' => now(),
    ]);

    ActivityLog::create([
        'feature' => 'Role',
        'action' => 'Create Role',
        'details' => 'Admin role created',
        'performed_by' => $this->user->id,
        'performed_at' => now(),
    ]);

    $this->actingAs($this->user)
        ->get('/activity-logs?search=John')
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->component('ActivityLogs/Index')
            ->has('logs.data', 1)
            ->where('logs.data.0.details', 'John Doe created')
        );
});

it('returns available features and actions', function () {
    // Create some test activity logs
    ActivityLog::create([
        'feature' => 'User',
        'action' => 'Create User',
        'details' => 'Test user created',
        'performed_by' => $this->user->id,
        'performed_at' => now(),
    ]);

    ActivityLog::create([
        'feature' => 'Role',
        'action' => 'Create Role',
        'details' => 'Test role created',
        'performed_by' => $this->user->id,
        'performed_at' => now(),
    ]);

    $this->actingAs($this->user)
        ->get('/activity-logs')
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->component('ActivityLogs/Index')
            ->has('availableFeatures', 2)
            ->has('availableActions', 2)
            ->where('availableFeatures', ['Role', 'User'])
            ->where('availableActions', ['Create Role', 'Create User'])
        );
});
