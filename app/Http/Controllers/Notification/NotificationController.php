<?php

namespace App\Http\Controllers\Notification;

use App\Http\Controllers\Controller;
use App\Http\Requests\Notification\MarkAsReadRequest;
use App\Http\Requests\Notification\UpdateNotificationRequest;
use App\Models\NotificationSetting;
use App\Services\NotificationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    public function __construct(
        private NotificationService $notificationService
    ) {}

    /**
     * Get paginated notifications for the user
     */
    public function index(): JsonResponse
    {
        $user = Auth::guard('tenant')->user();
        
        $notifications = $user->notifications()
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json($notifications);
    }

    /**
     * Mark a notification as read
     */
    public function markAsRead(MarkAsReadRequest $request): RedirectResponse
    {
        $user = Auth::guard('tenant')->user();
        $success = $this->notificationService->markAsRead(
            $request->validated('notification_id'),
            $user
        );

        if ($success) {
            return redirect()->back()->with('success', 'Notification marked as read');
        }

        return redirect()->back()->with('error', 'Notification not found or already read');
    }

    /**
     * Mark all notifications as read
     */
    public function markAllAsRead(): RedirectResponse
    {
        $user = Auth::guard('tenant')->user();
        $this->notificationService->markAllAsRead($user);

        return redirect()->back()->with('success', 'All notifications marked as read');
    }

    /**
     * Get notification notification
     */
    public function getSettings(): Response
    {
        $user = Auth::guard('tenant')->user();
        
        $notification = $user->notificationSettings()
            ->get()
            ->keyBy('event_type');

        $availableEvents = NotificationSetting::getAvailableEventTypes();

        return Inertia::render('manage-profile/notification', [
            'notification' => $notification,
            'availableEvents' => $availableEvents,
        ]);
    }

    /**
     * Update notification notification
     */
    public function updateSettings(UpdateNotificationRequest $request): RedirectResponse
    {
        $user = Auth::guard('tenant')->user();

        $validated = $request->validated();

        $this->notificationService->updateNotification($user, $validated['event_type'], [
            'email_enabled' => $validated['email_enabled'] ?? true,
            'push_enabled' => $validated['push_enabled'] ?? true,
            'in_app_enabled' => $validated['in_app_enabled'] ?? true,
        ]);

        return redirect()->back()->with('success', 'Notification settings updated successfully');
    }
}
