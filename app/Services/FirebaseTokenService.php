<?php

namespace App\Services;

use App\Models\FirebaseToken;
use App\Notifications\TestNotification;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;

class FirebaseTokenService
{
    public function storeToken(array $data): FirebaseToken
    {
        $user = Auth::user();
        $deviceName = $data['device_name'] ?? $this->getDeviceName();

        // Send test notification
        $user->notify((new TestNotification($deviceName))->delay(now()->addSeconds(10)));

        // Check if token already exists for this user
        $existingToken = FirebaseToken::where('user_id', $user->id)
            ->where('token', $data['token'])
            ->first();

        if ($existingToken) {
            // Update existing token
            $existingToken->update([
                'is_active' => true,
                'last_used_at' => now(),
                'device_type' => $data['device_type'] ?? 'web',
                'device_name' => $deviceName,
            ]);

            return $existingToken;
        }

        // Create new token
        return FirebaseToken::create([
            'user_id' => $user->id,
            'token' => $data['token'],
            'device_type' => $data['device_type'] ?? 'web',
            'device_name' => $deviceName,
            'is_active' => true,
            'last_used_at' => now(),
        ]);
    }

    public function getActiveTokens(): Collection
    {
        $user = Auth::user();

        return FirebaseToken::where('user_id', $user->id)
            ->where('is_active', true)
            ->get();
    }

    public function deactivateToken(string $token): bool
    {
        $user = Auth::user();

        $firebaseToken = FirebaseToken::where('user_id', $user->id)
            ->where('token', $token)
            ->first();

        if (! $firebaseToken) {
            return false;
        }

        $firebaseToken->deactivate();

        return true;
    }

    /**
     * Get device name from user agent
     */
    private function getDeviceName(): string
    {
        $userAgent = request()->userAgent();

        if (str_contains($userAgent, 'Chrome')) {
            return 'Chrome';
        } elseif (str_contains($userAgent, 'Firefox')) {
            return 'Firefox';
        } elseif (str_contains($userAgent, 'Safari')) {
            return 'Safari';
        } elseif (str_contains($userAgent, 'Edge')) {
            return 'Edge';
        }

        return 'Web Browser';
    }
}
