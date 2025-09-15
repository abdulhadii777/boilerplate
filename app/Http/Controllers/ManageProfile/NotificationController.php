<?php

namespace App\Http\Controllers\ManageProfile;

use App\Http\Controllers\Controller;
use App\Models\NotificationSetting;
use App\Services\NotificationService;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    public function __construct(
        private NotificationService $notificationService
    ) {}

    /**
     * Display the notification manage profile page
     */
    public function edit(): Response
    {
        $user = Auth::guard('tenant')->user();
        
        // Ensure user has default settings
        $this->notificationService->ensureSettings($user);
        
        // Get existing notifications settings
        $settings = $user->notificationSettings()
            ->get()
            ->keyBy('event_type');

        $availableEvents = NotificationSetting::getAvailableEventTypes();
        $unreadCount = $this->notificationService->getUnreadCount($user);

        return Inertia::render('manage-profile/notification', [
            'settings' => $settings,
            'availableEvents' => $availableEvents,
            'unreadCount' => $unreadCount,
        ]);
    }
}
