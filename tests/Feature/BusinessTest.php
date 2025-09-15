<?php

use App\Models\CentralUser;
use App\Models\Tenant;
use App\Services\BusinessService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    // Create a central user
    $this->centralUser = CentralUser::factory()->create();
    $this->businessService = app(BusinessService::class);
});

it('can create a new tenant', function () {
    $tenant = $this->businessService->createTenant($this->centralUser, 'Test Business');

    expect($tenant)->toBeInstanceOf(Tenant::class);
    expect($tenant->name)->toBe('Test Business');

    // Check that the tenant is associated with the central user
    $this->centralUser->refresh();
    expect($this->centralUser->tenants)->toHaveCount(1);
    expect($this->centralUser->tenants->first()->id)->toBe($tenant->id);
});

it('can get user tenants', function () {
    // Create a tenant first
    $tenant = $this->businessService->createTenant($this->centralUser, 'Test Business');

    $tenants = $this->businessService->getUserTenants($this->centralUser);

    expect($tenants)->toHaveCount(1);
    expect($tenants->first()->name)->toBe('Test Business');
});

it('can check tenant access', function () {
    // Create a tenant
    $tenant = $this->businessService->createTenant($this->centralUser, 'Test Business');

    // Check access to owned tenant
    expect($this->businessService->hasAccessToTenant($this->centralUser, $tenant))->toBeTrue();

    // Create another tenant not owned by user
    $otherTenant = Tenant::create(['name' => 'Other Business']);
    expect($this->businessService->hasAccessToTenant($this->centralUser, $otherTenant))->toBeFalse();
});

it('can get tenant details', function () {
    $tenant = $this->businessService->createTenant($this->centralUser, 'Test Business');

    $details = $this->businessService->getTenantDetails($tenant);

    expect($details)->toBeArray();
    expect($details['name'])->toBe('Test Business');
    expect($details['id'])->toBe($tenant->id);
});

it('validates tenant creation request', function () {
    $response = $this->actingAs($this->centralUser, 'web')
        ->post(route('business.store'), [
            'name' => 'Test Business',
        ]);

    $response->assertRedirect(route('business.index'));
    $response->assertSessionHas('success', "Business 'Test Business' created successfully.");

    $this->assertDatabaseHas('tenants', [
        'name' => 'Test Business',
    ]);
});

it('validates tenant name is required', function () {
    $response = $this->actingAs($this->centralUser, 'web')
        ->post(route('business.store'), []);

    $response->assertSessionHasErrors(['name']);
});

it('validates tenant name minimum length', function () {
    $response = $this->actingAs($this->centralUser, 'web')
        ->post(route('business.store'), [
            'name' => 'A',
        ]);

    $response->assertSessionHasErrors(['name']);
});
