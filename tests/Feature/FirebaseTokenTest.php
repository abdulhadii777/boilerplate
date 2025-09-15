<?php

use App\Models\FirebaseToken;
use App\Models\CentralUser;
use App\Notifications\TestNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;

uses(RefreshDatabase::class);

it('can save fcm token for authenticated user', function () {
    $user = CentralUser::factory()->create();

    $response = $this->actingAs($user)->post('/notifications/api/save-fcm-token', [
        'token' => 'test-fcm-token-123',
        'device_type' => 'web',
        'device_name' => 'Chrome',
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('success', 'Token saved successfully. Check your device for a test notification!');

    $this->assertDatabaseHas('firebase_tokens', [
        'user_id' => $user->id,
        'token' => 'test-fcm-token-123',
        'device_type' => 'web',
        'device_name' => 'Chrome',
        'is_active' => true,
    ]);
});

it('updates existing token if already exists', function () {
    $user = CentralUser::factory()->create();

    // Create existing token
    FirebaseToken::factory()->create([
        'user_id' => $user->id,
        'token' => 'test-fcm-token-123',
        'is_active' => false,
    ]);

    $response = $this->actingAs($user)->post('/notifications/api/save-fcm-token', [
        'token' => 'test-fcm-token-123',
        'device_type' => 'web',
        'device_name' => 'Firefox',
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('success', 'Token saved successfully. Check your device for a test notification!');

    $this->assertDatabaseHas('firebase_tokens', [
        'user_id' => $user->id,
        'token' => 'test-fcm-token-123',
        'device_type' => 'web',
        'device_name' => 'Firefox',
        'is_active' => true,
    ]);
});

it('validates required fields', function () {
    $user = CentralUser::factory()->create();

    $response = $this->actingAs($user)->post('/notifications/api/save-fcm-token', []);

    $response->assertRedirect();
    $response->assertSessionHasErrors(['token']);
});

it('can retrieve user fcm tokens', function () {
    $user = CentralUser::factory()->create();

    // Create some tokens
    FirebaseToken::factory()->count(3)->create([
        'user_id' => $user->id,
        'is_active' => true,
    ]);

    $response = $this->actingAs($user)->get('/notifications/api/fcm-tokens');

    $response->assertRedirect();
    $response->assertSessionHas('fcmTokens', [
        'success' => true,
        'tokens' => $user->firebaseTokens()->where('is_active', true)->get(),
    ]);
});

it('can deactivate fcm token', function () {
    $user = CentralUser::factory()->create();

    $token = FirebaseToken::factory()->create([
        'user_id' => $user->id,
        'is_active' => true,
    ]);

    $response = $this->actingAs($user)->delete('/notifications/api/fcm-token', [
        'token' => $token->token,
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('success', 'Notification disabled successfully');

    $this->assertDatabaseHas('firebase_tokens', [
        'id' => $token->id,
        'is_active' => false,
    ]);
});

it('requires authentication', function () {
    $response = $this->post('/notifications/api/save-fcm-token', [
        'token' => 'test-token',
    ]);

    $response->assertRedirect('/login');
});

it('sends test notification when new fcm token is saved', function () {
    $user = CentralUser::factory()->create();
    $this->actingAs($user);

    // Mock the notification
    Notification::fake();

    $response = $this->post('/notifications/api/save-fcm-token', [
        'token' => 'test-fcm-token-123',
        'device_type' => 'web',
        'device_name' => 'Chrome',
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('success', 'Token saved successfully. Check your device for a test notification!');

    // Assert that the test notification was sent
    Notification::assertSentTo(
        $user,
        TestNotification::class,
        function ($notification) {
            return $notification->deviceName === 'Chrome';
        }
    );
});
