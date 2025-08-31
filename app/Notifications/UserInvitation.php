<?php

namespace App\Notifications;

use App\Models\Invitation;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class UserInvitation extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        public Invitation $invitation
    ) {}

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mailer that should be used to send this notification.
     */
    public function viaMailer(): string
    {
        return 'hostinger';
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $acceptUrl = route('invitation.accept', ['token' => $this->invitation->token]);

        return (new MailMessage)
            ->subject("You're invited to join ".$this->invitation->tenant->name)
            ->greeting('Hello!')
            ->line("You've been invited to join ".$this->invitation->tenant->name.' as a '.$this->invitation->role.'.')
            ->line('Click the button below to accept this invitation and create your account.')
            ->action('Accept Invitation', $acceptUrl)
            ->line('This invitation will expire in 7 days.')
            ->line('If you did not expect this invitation, you can safely ignore this email.');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'invitation_id' => $this->invitation->id,
            'tenant_id' => $this->invitation->tenant_id,
            'role' => $this->invitation->role,
            'expires_at' => $this->invitation->expires_at,
        ];
    }
}
