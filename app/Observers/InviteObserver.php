<?php

namespace App\Observers;

use App\Events\InviteEvent;
use App\Models\Invite;

class InviteObserver
{
    /**
     * Handle the Invite "created" event.
     */
    public function created(Invite $invite): void
    {
        event(new InviteEvent($invite, 'sent'));
    }

    /**
     * Handle the Invite "updated" event.
     */
    public function updated(Invite $invite): void
    {
        // Check if invite was accepted
        if ($invite->wasChanged('accepted_at') && $invite->accepted_at !== null) {
            event(new InviteEvent($invite, 'accepted'));
        }

        // Check if token was regenerated (resent)
        if ($invite->wasChanged('token') && $invite->wasChanged('expires_at')) {
            event(new InviteEvent($invite, 'resent'));
        }
    }

    /**
     * Handle the Invite "deleted" event.
     */
    public function deleted(Invite $invite): void
    {
        event(new InviteEvent($invite, 'cancelled'));
    }
}
