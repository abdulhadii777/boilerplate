<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Log;
use NotificationChannels\Fcm\FcmChannel;
use NotificationChannels\Fcm\FcmMessage;
use NotificationChannels\Fcm\Resources\Notification as FcmNotification;

class TestNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public string $deviceName = 'Unknown Device'
    ) {}

    public function via($notifiable): array
    {
        return [FcmChannel::class];
    }

    public function toMail($notifiable): null
    {
        return null;
    }

    public function toFcm($notifiable): FcmMessage
    {
        try {
            $fcmMessage = FcmMessage::create()
                ->notification(FcmNotification::create()
                    ->title('Test Notification - FCM Token Registered')
                    ->body("Your FCM token has been successfully registered for device: {$this->deviceName}. This is a test notification to confirm that push notifications are working correctly.")
                )
                ->data([
                    'type' => 'fcm_token_registered',
                    'device_name' => $this->deviceName,
                    'timestamp' => now()->toISOString(),
                    'click_action' => config('app.url'),
                ]);
        } catch (\Exception $e) {
            Log::error('TestNotification toFcm error', ['error' => $e->getMessage()]);

            return FcmMessage::create();
        }

        return $fcmMessage;
    }
}
