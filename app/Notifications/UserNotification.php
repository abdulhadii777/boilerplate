<?php

namespace App\Notifications;

use App\Mail\NotificationMail;
use App\Models\NotificationSetting;
use App\Models\TenantUser;
use Illuminate\Notifications\Notification;
use NotificationChannels\Fcm\FcmChannel;
use NotificationChannels\Fcm\FcmMessage;
use NotificationChannels\Fcm\Resources\Notification as FcmNotification;

class UserNotification extends Notification
{
    public function __construct(
        public TenantUser $user,
        public string $action,
        public array $metadata = []
    ) {}

    public function via($notifiable): array
    {
        $channels = [];

        // Check user preferences for this event type
        $setting = NotificationSetting::getUserSettingsForEvent($notifiable->id, "user_{$this->action}");

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
        $data = $this->buildData();
        $actionUrl = $this->getActionUrl();
        $actionText = $this->getActionText();

        return (new NotificationMail(
            title: $title,
            message: $message,
            data: $data,
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
            'title' => $this->getTitle(),
            'message' => $this->getMessage(),
            'user_id' => (string) $this->user->id,
            'user_name' => (string) $this->user->name,
            'event_type' => "user_{$this->action}",
            'timestamp' => now()->toISOString(),
        ];

        // Add action-specific data
        if ($this->action === 'role_updated') {
            $oldRole = $this->metadata['old_role'] ?? null;
            $newRole = $this->metadata['new_role'] ?? null;

            $data['old_role_id'] = $this->getRoleId($oldRole);
            $data['old_role_name'] = $this->getRoleName($oldRole);
            $data['new_role_id'] = $this->getRoleId($newRole);
            $data['new_role_name'] = $this->getRoleName($newRole);
        }

        return $data;
    }

    public function toFcm($notifiable): FcmMessage
    {
        $clickAction = $this->action !== 'deleted' ? $this->getActionUrl() : '';

        return FcmMessage::create()
            ->notification(FcmNotification::create()
                ->title($this->getTitle())
                ->body($this->getMessage())
            )
            ->data([
                'type' => "user_{$this->action}",
                'user_id' => (string) $this->user->id,
                'user_name' => $this->user->name,
                'click_action' => $clickAction,
                'timestamp' => now()->toISOString(),
            ]);
    }

    private function getTitle(): string
    {
        return match ($this->action) {
            'invited' => 'User Invited',
            'role_updated' => 'User Role Updated',
            'disabled' => 'User Disabled',
            'enabled' => 'User Enabled',
            'deleted' => 'User Deleted',
            default => 'User Action',
        };
    }

    private function getMessage(): string
    {
        return match ($this->action) {
            'invited' => "User {$this->user->name} has been invited to join the platform.",
            'role_updated' => "User {$this->user->name} has had their role updated from ".
                             $this->getRoleName($this->metadata['old_role'] ?? null).
                             ' to '.$this->getRoleName($this->metadata['new_role'] ?? null).'.',
            'disabled' => "User {$this->user->name} has been disabled.",
            'enabled' => "User {$this->user->name} has been enabled.",
            'deleted' => "User {$this->user->name} has been deleted.",
            default => "User {$this->user->name} action performed.",
        };
    }

    private function getRoleName($role): string
    {
        if (! $role) {
            return 'No Role';
        }

        if (is_string($role)) {
            return $role;
        }

        if (is_object($role) && method_exists($role, 'getAttribute')) {
            return $role->getAttribute('name') ?? 'Unknown Role';
        }

        if (is_array($role) && isset($role['name'])) {
            return $role['name'];
        }

        return 'Unknown Role';
    }

    private function getRoleId($role): ?int
    {
        if (! $role) {
            return null;
        }

        if (is_object($role) && method_exists($role, 'getAttribute')) {
            return $role->getAttribute('id');
        }

        if (is_array($role) && isset($role['id'])) {
            return $role['id'];
        }

        return null;
    }

    private function buildData(): array
    {
        $data = [
            'user_id' => $this->user->id,
            'user_name' => $this->user->name,
            'user_email' => $this->user->email,
            'action' => $this->action,
            'timestamp' => now()->toISOString(),
        ];

        // Add action-specific data
        if ($this->action === 'role_updated') {
            $data['old_role'] = $this->getRoleName($this->metadata['old_role'] ?? null);
            $data['new_role'] = $this->getRoleName($this->metadata['new_role'] ?? null);
        }

        return array_filter($data, fn ($value) => $value !== null);
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

        return route('users.index', ['tenant' => $tenantId]);
    }

    private function getActionText(): ?string
    {
        return match ($this->action) {
            'invited' => 'View Invitation',
            'role_updated' => 'View User',
            'disabled' => 'View User',
            'enabled' => 'View User',
            default => 'View Details',
        };
    }

    private function getHeaderTitle(): string
    {
        return match ($this->action) {
            'invited', 'role_updated', 'disabled', 'enabled', 'deleted' => 'User Update',
            default => 'Notification',
        };
    }

    private function getHeaderSubtitle(): string
    {
        return match ($this->action) {
            'invited', 'role_updated', 'disabled', 'enabled', 'deleted' => 'User account has been updated',
            default => 'You have a new notification',
        };
    }
}
