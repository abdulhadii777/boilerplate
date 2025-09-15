<?php

use App\Models\NotificationSetting;
use App\Models\CentralUser;
use App\Services\NotificationService;

it('creates notification settings automatically when a user is created', function () {
    // Create a new user
    $user = CentralUser::factory()->create();

    // Check that notification settings were created
    expect($user->notificationSettings)->toHaveCount(12); // All available event types

    // Verify specific event types exist
    $eventTypes = NotificationSetting::getAvailableEventTypes();
    foreach (array_keys($eventTypes) as $eventType) {
        expect($user->notificationSettings()
            ->where('event_type', $eventType)
            ->first()
        )->not->toBeNull();
    }
});

it('creates notification settings with default values', function () {
    $user = CentralUser::factory()->create();

    $user->notificationSettings->each(function ($setting) {
        expect($setting->email_enabled)->toBeTrue();
        expect($setting->push_enabled)->toBeTrue();
        expect($setting->in_app_enabled)->toBeTrue();
    });
});

it('does not duplicate notification settings for existing users', function () {
    $user = CentralUser::factory()->create();

    // Count initial settings
    $initialCount = $user->notificationSettings()->count();

    // Try to create settings again
    app(NotificationService::class)->createDefaultSettings($user);

    // Count should remain the same
    expect($user->notificationSettings()->count())->toBe($initialCount);
});

it('ensures notification settings exist before updating', function () {
    $user = CentralUser::factory()->create();

    // Delete all notification settings
    $user->notificationSettings()->delete();

    // Update settings - this should recreate them
    app(NotificationService::class)->updateSettings($user, 'user_invited', [
        'email_enabled' => false,
    ]);

    // Check that settings were recreated
    expect($user->notificationSettings()->count())->toBe(12);

    // Check that the specific setting was updated
    $setting = $user->notificationSettings()
        ->where('event_type', 'user_invited')
        ->first();

    expect($setting->email_enabled)->toBeFalse();
});

it('checks if notification is enabled for a user', function () {
    $user = CentralUser::factory()->create();

    $service = app(NotificationService::class);

    // Check default enabled state
    expect($service->isNotificationEnabled($user, 'user_invited', 'email'))->toBeTrue();

    // Disable email notifications for user_invited
    $service->updateSettings($user, 'user_invited', ['email_enabled' => false]);

    // Check that it's now disabled
    expect($service->isNotificationEnabled($user, 'user_invited', 'email'))->toBeFalse();
    expect($service->isNotificationEnabled($user, 'user_invited', 'push'))->toBeTrue();
});
