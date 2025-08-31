<?php

use App\Models\Invitation;
use App\Models\Tenant;
use Carbon\Carbon;

beforeEach(function () {
    $this->tenant = Tenant::create(['id' => 'test-tenant']);
});

it('generates a token when creating an invitation', function () {
    $invitation = Invitation::create([
        'tenant_id' => $this->tenant->id,
        'email' => 'test@example.com',
        'role' => 'member',
    ]);

    expect($invitation->token)->toBeString();
    expect(strlen($invitation->token))->toBe(64);
});

it('sets expiration date when creating an invitation', function () {
    $invitation = Invitation::create([
        'tenant_id' => $this->tenant->id,
        'email' => 'test@example.com',
        'role' => 'member',
    ]);

    expect($invitation->expires_at)->toBeInstanceOf(Carbon::class);
    expect($invitation->expires_at->isAfter(Carbon::now()))->toBeTrue();
});

it('can check if invitation is expired', function () {
    $invitation = Invitation::create([
        'tenant_id' => $this->tenant->id,
        'email' => 'test@example.com',
        'role' => 'member',
        'expires_at' => Carbon::now()->subDay(),
    ]);

    expect($invitation->isExpired())->toBeTrue();
});

it('can check if invitation can be accepted', function () {
    $validInvitation = Invitation::create([
        'tenant_id' => $this->tenant->id,
        'email' => 'valid@example.com',
        'role' => 'member',
        'expires_at' => Carbon::now()->addDay(),
    ]);

    $expiredInvitation = Invitation::create([
        'tenant_id' => $this->tenant->id,
        'email' => 'expired@example.com',
        'role' => 'member',
        'expires_at' => Carbon::now()->subDay(),
    ]);

    $acceptedInvitation = Invitation::create([
        'tenant_id' => $this->tenant->id,
        'email' => 'accepted@example.com',
        'role' => 'member',
        'expires_at' => Carbon::now()->addDay(),
        'status' => 'accepted',
    ]);

    expect($validInvitation->canBeAccepted())->toBeTrue();
    expect($expiredInvitation->canBeAccepted())->toBeFalse();
    expect($acceptedInvitation->canBeAccepted())->toBeFalse();
});

it('can mark invitation as accepted', function () {
    $invitation = Invitation::create([
        'tenant_id' => $this->tenant->id,
        'email' => 'test@example.com',
        'role' => 'member',
    ]);

    $invitation->markAsAccepted();

    expect($invitation->fresh()->status)->toBe('accepted');
});

it('can mark invitation as expired', function () {
    $invitation = Invitation::create([
        'tenant_id' => $this->tenant->id,
        'email' => 'test@example.com',
        'role' => 'member',
    ]);

    $invitation->markAsExpired();

    expect($invitation->fresh()->status)->toBe('expired');
});

it('belongs to a tenant', function () {
    $invitation = Invitation::create([
        'tenant_id' => $this->tenant->id,
        'email' => 'test@example.com',
        'role' => 'member',
    ]);

    expect($invitation->tenant)->toBeInstanceOf(Tenant::class);
    expect($invitation->tenant->id)->toBe($this->tenant->id);
});
