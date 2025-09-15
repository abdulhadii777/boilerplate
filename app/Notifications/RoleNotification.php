<?php

namespace App\Notifications;

use App\Mail\NotificationMail;
use App\Models\NotificationSetting;
use App\Models\Role;
use Illuminate\Notifications\Notification;
use NotificationChannels\Fcm\FcmChannel;
use NotificationChannels\Fcm\FcmMessage;
use NotificationChannels\Fcm\Resources\Notification as FcmNotification;

class RoleNotification extends Notification
{
    public function __construct(
        public Role $role,
        public string $action,
        public array $metadata = []
    ) {}

    public function via($notifiable): array
    {
        $channels = [];

        // Check user preferences for this event type
        $setting = NotificationSetting::getUserSettingsForEvent($notifiable->id, "role_{$this->action}");

        if ($setting) {
            if ($setting->isEmailEnabled()) {
                $channels[] = 'mail';
            }
            if ($setting->isPushEnabled()) {
                $channels[] = FcmChannel::class;
            }
            if ($setting->isInAppEnabled()) {
                $channels[] = 'database';
            }
        }

        return $channels;
    }

    public function toMail($notifiable): NotificationMail
    {
        $title = $this->getTitle();
        $message = $this->getMessage();
        $actionUrl = $this->getActionUrl();
        $actionText = $this->getActionText();

        return (new NotificationMail(
            title: $title,
            message: $message,
            actionUrl: $actionUrl,
            actionText: $actionText,
            headerTitle: $this->getHeaderTitle(),
            headerSubtitle: $this->getHeaderSubtitle()
        ))
            ->to($notifiable->routeNotificationFor('mail'));
    }

    public function toArray($notifiable): array
    {
        $data = [
            'message' => $this->getMessage(),
            'role_id' => $this->role->id,
            'role_name' => $this->role->name,
            'event_type' => "role_{$this->action}",
            'timestamp' => now()->toISOString(),
        ];

        return $data;
    }

    public function toFcm($notifiable): FcmMessage
    {
        $clickAction = $this->action !== 'deleted' ? $this->getActionUrl() : '';

        return FcmMessage::create()
            ->notification(
                FcmNotification::create()
                    ->title($this->getTitle())
                    ->body($this->getMessage())
            )
            ->data([
                'type' => "role_{$this->action}",
                'role_id' => (string) $this->role->id,
                'role_name' => (string) $this->role->name,
                'click_action' => $clickAction,
                'timestamp' => now()->toISOString(),
            ]);
    }

    private function getTitle(): string
    {
        return match ($this->action) {
            'created' => 'Role Created',
            'updated' => 'Role Updated',
            'deleted' => 'Role Deleted',
            default => 'Role Action',
        };
    }

    private function getMessage(): string
    {
        return match ($this->action) {
            'created' => "Role '{$this->role->name}' has been created by {$this->metadata['performer_name']}.",
            'updated' => "Role '{$this->role->name}' has been updated by {$this->metadata['performer_name']}.",
            'deleted' => "Role '{$this->role->name}' has been deleted by {$this->metadata['performer_name']}.",
            default => "Role '{$this->role->name}' action performed by {$this->metadata['performer_name']}.",
        };
    }

    private function getActionUrl(): ?string
    {
        if ($this->action === 'deleted') {
            return null;
        }

        $tenantId = tenancy()->tenant?->id;
        if (!$tenantId) {
            return null;
        }

        return route('roles.index', ['tenant' => $tenantId]);
    }

    private function getActionText(): ?string
    {
        return match ($this->action) {
            'created' => 'View Roles',
            'updated' => 'View Roles',
            default => 'View Details',
        };
    }

    private function getHeaderTitle(): string
    {
        return match ($this->action) {
            'created' => 'Role Created',
            'updated' => 'Role Updated',
            'deleted' => 'Role Deleted',
            default => 'Notification',
        };
    }

    private function getHeaderSubtitle(): string
    {
        return match ($this->action) {
            'created', 'updated', 'deleted' => 'Role has been ' . $this->action,
            default => 'You have a new notification',
        };
    }
}
