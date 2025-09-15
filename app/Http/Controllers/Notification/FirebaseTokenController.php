<?php

namespace App\Http\Controllers\Notification;

use App\Http\Controllers\Controller;
use App\Http\Requests\FirebaseToken\DestroyFirebaseTokenRequest;
use App\Http\Requests\FirebaseToken\StoreFirebaseTokenRequest;
use App\Services\FirebaseTokenService;
use Illuminate\Http\RedirectResponse;

class FirebaseTokenController extends Controller
{
    public function __construct(
        private FirebaseTokenService $firebaseTokenService
    ) {}

    /**
     * Save FCM token for the authenticated user
     */
    public function store(StoreFirebaseTokenRequest $request): RedirectResponse
    {
        try {
            $this->firebaseTokenService->storeToken($request->validated());

            return redirect()->back()->with('success', 'Token saved successfully. Check your device for a test notification!');

        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to save token: '.$e->getMessage());
        }
    }

    /**
     * Get all active tokens for the authenticated user
     */
    public function index(): RedirectResponse
    {
        try {
            $tokens = $this->firebaseTokenService->getActiveTokens();

            return redirect()->back()->with('fcmTokens', [
                'success' => true,
                'tokens' => $tokens,
            ]);

        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to retrieve tokens: '.$e->getMessage());
        }
    }

    /**
     * Deactivate a specific token
     */
    public function destroy(DestroyFirebaseTokenRequest $request): RedirectResponse
    {
        try {
            $success = $this->firebaseTokenService->deactivateToken($request->validated('token'));

            if (! $success) {
                return redirect()->back()->with('error', 'Token not found');
            }

            return redirect()->back()->with('success', 'Notification disabled successfully');

        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to deactivate token: '.$e->getMessage());
        }
    }
}
