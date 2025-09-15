<?php

namespace App\Mail;

use App\Models\Invite;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class UserInvitation extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Invite $invite
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'You have been invited to join our platform',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.invite',
            with: [
                'headerTitle' => 'You\'re Invited!',
                'headerSubtitle' => 'Join our team and start collaborating',
                'invitedBy' => $this->invite->invitedBy->name ?? 'a team member',
                'roleName' => $this->invite->role->name,
                'acceptUrl' => route('invites.accept.show', $this->invite->token),
                'additionalInfo' => null,
            ],
        );
    }
}
