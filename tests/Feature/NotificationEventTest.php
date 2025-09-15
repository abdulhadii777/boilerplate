<?php

use App\Events\InviteEvent;
use App\Events\RoleEvent;
use App\Events\UserEvent;
use App\Models\Invite;
use App\Models\NotificationSetting;
use App\Models\Role;
use App\Models\CentralUser;
use App\Services\UserInviteService;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Notification;

it('dispatches user_invited event when creating an invite', function () {
    Event::fake();

    $user = CentralUser::factory()->create();
    $role = Role::factory()->create();

    // Create notification settings for the user
    NotificationSetting::create([
        'user_id' => $user->id,
        'event_type' => 'user_invited',
        'email_enabled' => true,
        'push_enabled' => true,
        'in_app_enabled' => true,
    ]);

    // Use the service to create invites (this should trigger the user_invited event)
    $inviteService = app(UserInviteService::class);
    $invites = $inviteService->createInvites(['test@example.com'], $role->id);

    Event::assertDispatched(UserEvent::class, function ($event) {
        return $event->action === 'invited';
    });
});

it('dispatches user_role_updated event when user role changes', function () {
    Event::fake();

    $user = CentralUser::factory()->create();
    $oldRole = Role::factory()->create();
    $newRole = Role::factory()->create();

    // Set initial role
    $user->update(['role_id' => $oldRole->id]);

    // Create notification settings for another user
    $adminUser = CentralUser::factory()->create();
    NotificationSetting::create([
        'user_id' => $adminUser->id,
        'event_type' => 'user_role_updated',
        'email_enabled' => true,
        'push_enabled' => true,
        'in_app_enabled' => true,
    ]);

    // Change role (this should trigger the observer)
    $user->update(['role_id' => $newRole->id]);

    Event::assertDispatched(UserEvent::class, function ($event) use ($user) {
        return $event->user->id === $user->id && $event->action === 'role_updated';
    });
});

it('dispatches user_disabled event when user is deactivated', function () {
    Event::fake();

    $user = CentralUser::factory()->create(['is_active' => true]);

    // Create notification settings for another user
    $adminUser = CentralUser::factory()->create();
    NotificationSetting::create([
        'user_id' => $adminUser->id,
        'event_type' => 'user_disabled',
        'email_enabled' => true,
        'push_enabled' => true,
        'in_app_enabled' => true,
    ]);

    // Disable user (this should trigger the observer)
    $user->update(['is_active' => false]);

    Event::assertDispatched(UserEvent::class, function ($event) use ($user) {
        return $event->user->id === $user->id && $event->action === 'disabled';
    });
});

it('dispatches user_enabled event when user is activated', function () {
    Event::fake();

    $user = CentralUser::factory()->create(['is_active' => false]);

    // Create notification settings for another user
    $adminUser = CentralUser::factory()->create();
    NotificationSetting::create([
        'user_id' => $adminUser->id,
        'event_type' => 'user_enabled',
        'email_enabled' => true,
        'push_enabled' => true,
        'in_app_enabled' => true,
    ]);

    // Enable user (this should trigger the observer)
    $user->update(['is_active' => true]);

    Event::assertDispatched(UserEvent::class, function ($event) use ($user) {
        return $event->user->id === $user->id && $event->action === 'enabled';
    });
});

it('dispatches user_deleted event when user is deleted', function () {
    Event::fake();

    $user = CentralUser::factory()->create();

    // Create notification settings for another user
    $adminUser = CentralUser::factory()->create();
    NotificationSetting::create([
        'user_id' => $adminUser->id,
        'event_type' => 'user_deleted',
        'email_enabled' => true,
        'push_enabled' => true,
        'in_app_enabled' => true,
    ]);

    // Delete user (this should trigger the observer)
    $user->delete();

    Event::assertDispatched(UserEvent::class, function ($event) use ($user) {
        return $event->user->id === $user->id && $event->action === 'deleted';
    });
});

it('dispatches role_created event when role is created', function () {
    Event::fake();

    $adminUser = CentralUser::factory()->create();
    NotificationSetting::create([
        'user_id' => $adminUser->id,
        'event_type' => 'role_created',
        'email_enabled' => true,
        'push_enabled' => true,
        'in_app_enabled' => true,
    ]);

    // Create role (this should trigger the observer)
    $role = Role::create([
        'name' => 'Test Role',
        'description' => 'Test Description',
    ]);

    Event::assertDispatched(RoleEvent::class, function ($event) use ($role) {
        return $event->role->id === $role->id && $event->action === 'created';
    });
});

it('dispatches role_updated event when role is updated', function () {
    Event::fake();

    $role = Role::factory()->create();

    $adminUser = CentralUser::factory()->create();
    NotificationSetting::create([
        'user_id' => $adminUser->id,
        'event_type' => 'role_updated',
        'email_enabled' => true,
        'push_enabled' => true,
        'in_app_enabled' => true,
    ]);

    // Update role (this should trigger the observer)
    $role->update(['name' => 'Updated Role Name']);

    Event::assertDispatched(RoleEvent::class, function ($event) use ($role) {
        return $event->role->id === $role->id && $event->action === 'updated';
    });
});

it('dispatches role_deleted event when role is deleted', function () {
    Event::fake();

    $role = Role::factory()->create();

    $adminUser = CentralUser::factory()->create();
    NotificationSetting::create([
        'user_id' => $adminUser->id,
        'event_type' => 'role_deleted',
        'email_enabled' => true,
        'push_enabled' => true,
        'in_app_enabled' => true,
    ]);

    // Delete role (this should trigger the observer)
    $role->delete();

    Event::assertDispatched(RoleEvent::class, function ($event) use ($role) {
        return $event->role->id === $role->id && $event->action === 'deleted';
    });
});

it('dispatches invite_sent event when creating an invite', function () {
    Event::fake();

    $user = CentralUser::factory()->create();
    $role = Role::factory()->create();

    // Create notification settings for the user
    NotificationSetting::create([
        'user_id' => $user->id,
        'event_type' => 'invite_sent',
        'email_enabled' => true,
        'push_enabled' => true,
        'in_app_enabled' => true,
    ]);

    // Create an invite (this should trigger the observer)
    $invite = Invite::create([
        'email' => 'test@example.com',
        'role_id' => $role->id,
        'invited_by' => $user->id,
        'token' => \Illuminate\Support\Str::random(64),
    ]);

    Event::assertDispatched(InviteEvent::class, function ($event) use ($invite) {
        return $event->invite->id === $invite->id && $event->action === 'sent';
    });
});

it('dispatches invite_cancelled event when invite is deleted', function () {
    Event::fake();

    $invite = Invite::factory()->create();

    $user = CentralUser::factory()->create();
    NotificationSetting::create([
        'user_id' => $user->id,
        'event_type' => 'invite_cancelled',
        'email_enabled' => true,
        'push_enabled' => true,
        'in_app_enabled' => true,
    ]);

    // Delete invite (this should trigger the observer)
    $invite->delete();

    Event::assertDispatched(InviteEvent::class, function ($event) use ($invite) {
        return $event->invite->id === $invite->id && $event->action === 'cancelled';
    });
});

it('dispatches invite_resent event when invite token is regenerated', function () {
    Event::fake();

    $invite = Invite::factory()->create();

    $user = CentralUser::factory()->create();
    NotificationSetting::create([
        'user_id' => $user->id,
        'event_type' => 'invite_resent',
        'email_enabled' => true,
        'push_enabled' => true,
        'in_app_enabled' => true,
    ]);

    // Regenerate token (this should trigger the observer)
    $invite->update([
        'token' => \Illuminate\Support\Str::random(64),
        'expires_at' => now()->addDays(7),
    ]);

    Event::assertDispatched(InviteEvent::class, function ($event) use ($invite) {
        return $event->invite->id === $invite->id && $event->action === 'resent';
    });
});

it('sends notifications for all event types', function () {
    Notification::fake();

    $adminUser = CentralUser::factory()->create();
    $regularUser = CentralUser::factory()->create();

    // Create notification settings for all event types
    $eventTypes = NotificationSetting::getAvailableEventTypes();
    foreach (array_keys($eventTypes) as $eventType) {
        NotificationSetting::create([
            'user_id' => $adminUser->id,
            'event_type' => $eventType,
            'email_enabled' => true,
            'push_enabled' => true,
            'in_app_enabled' => true,
        ]);
    }

    // Test user events
    $testUser = CentralUser::factory()->create();
    event(new UserEvent($testUser, 'invited'));
    event(new UserEvent($testUser, 'role_updated'));
    event(new UserEvent($testUser, 'disabled'));
    event(new UserEvent($testUser, 'enabled'));
    event(new UserEvent($testUser, 'deleted'));

    // Test role events
    $testRole = Role::factory()->create();
    event(new RoleEvent($testRole, 'created'));
    event(new RoleEvent($testRole, 'updated'));
    event(new RoleEvent($testRole, 'deleted'));

    // Test invite events
    $testInvite = Invite::factory()->create();
    event(new InviteEvent($testInvite, 'sent'));
    event(new InviteEvent($testInvite, 'cancelled'));
    event(new InviteEvent($testInvite, 'resent'));

    // Verify notifications were sent
    // Note: This will fail if the notification listeners aren't properly implemented
    // We need to ensure all events trigger notifications
    expect($adminUser->notifications)->toHaveCount(12);
});
