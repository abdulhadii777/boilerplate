<?php

namespace App\Notifications;

use App\Mail\NotificationMail;
use App\Models\Invite;
use App\Models\NotificationSetting;
use Illuminate\Notifications\Notification;
use NotificationChannels\Fcm\FcmChannel;
use NotificationChannels\Fcm\FcmMessage;
use NotificationChannels\Fcm\Resources\Notification as FcmNotification;

class InviteNotification extends Notification
{
    public function __construct(
        public Invite $invite,
        public string $action,
        public array $metadata = []
    ) {}

    public function via($notifiable): array
    {
        $channels = [];

        // Check user preferences for this event type
        $setting = NotificationSetting::getUserSettingsForEvent($notifiable->id, "invite_{$this->action}");

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
        ))->to($notifiable->routeNotificationFor('mail'));
    }

    public function toArray($notifiable): array
    {
        $data = [
            'title' => $this->getTitle(),
            'message' => $this->getMessage(),
            'invite_id' => $this->invite->id,
            'event_type' => "invite_{$this->action}",
            'timestamp' => now()->toISOString(),
        ];

        // Add action-specific data for sent invites
        if ($this->action === 'sent') {
            $data['invite_token'] = $this->invite->token;
        }

        return $data;
    }

    public function toFcm($notifiable): FcmMessage
    {
        $clickAction = $this->action === 'sent' ? $this->getActionUrl() : '';

        return FcmMessage::create()
            ->notification(FcmNotification::create()
                ->title($this->getTitle())
                ->body($this->getMessage())
            )
            ->data([
                'invite_id' => (string) $this->invite->id,
                'message' => $this->getMessage(),
                'action' => $this->action,
                'timestamp' => now()->toISOString(),
                'click_action' => $clickAction,
                'event_type' => "invite_{$this->action}",
            ]);
    }

    private function getTitle(): string
    {
        return match ($this->action) {
            'sent' => 'New Invitation',
            'accepted' => 'Invitation Accepted',
            'cancelled' => 'Invitation Cancelled',
            'resent' => 'Invitation Resent',
            default => 'Invitation Update',
        };
    }

    private function getMessage(): string
    {
        return match ($this->action) {
            'sent' => "{$this->invite->invitedBy?->name} has invited '{$this->invite->email}' to join our platform with the role: '{$this->invite->role->name}'",
            'accepted' => "The invite to '{$this->invite->email}' for role '{$this->invite->role->name}' has been accepted.",
            'cancelled' => "An invite to '{$this->invite->email}' for role '{$this->invite->role->name}'  has been cancelled by '{$this->invite->invitedBy?->name}'.",
            'resent' => "An invite to '{$this->invite->email}' for role '{$this->invite->role->name}'  has been resent by '{$this->invite->invitedBy?->name}'.",
            default => 'Your invitation has been '.$this->action,
        };
    }
    
    private function getActionUrl(): ?string
    {
        $tenantId = tenancy()->tenant?->id;
        if (!$tenantId) {
            return null;
        }

        if ($this->action === 'sent') {
            return route('invites.accept.show', ['tenant' => $tenantId, 'token' => $this->invite->token]);
        }

        if ($this->action === 'accepted' || $this->action === 'resent') {
            return route('users.index', ['tenant' => $tenantId]);
        }

        return null;
    }

    private function getActionText(): ?string
    {
        return match ($this->action) {
            'sent' => 'Accept Invitation',
            'accepted' => 'View Invites',
            'resent' => 'View Invites',
            default => null,
        };
    }

    private function getHeaderTitle(): string
    {
        return match ($this->action) {
            'sent', 'accepted', 'cancelled', 'resent' => 'Invitation is '.$this->action,
            default => 'Notification',
        };
    }

    private function getHeaderSubtitle(): string
    {
        return match ($this->action) {
            'sent', 'accepted', 'cancelled', 'resent' => 'Invitation status has been '.$this->action,
            default => 'You have a new notification',
        };
    }
}
