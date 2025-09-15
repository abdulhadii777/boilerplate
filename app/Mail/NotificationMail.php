<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NotificationMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $title,
        public string $message,
        public ?string $actionUrl = null,
        public ?string $actionText = null,
        public string $headerTitle = 'Notification',
        public string $headerSubtitle = 'You have a new notification'
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->title,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.notification',
            with: [
                'notificationTitle' => $this->title,
                'notificationMessage' => $this->message,
                'actionUrl' => $this->actionUrl,
                'actionText' => $this->actionText,
                'headerTitle' => $this->headerTitle,
                'headerSubtitle' => $this->headerSubtitle,
            ],
        );
    }
}
