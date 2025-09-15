<?php

namespace App\Events;

use App\Models\Invite;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Support\Facades\Auth;

class InviteEvent
{
    use Dispatchable, InteractsWithSockets;

    public function __construct(
        public Invite $invite,
        public string $action, // 'sent', 'cancelled', 'resent', 'accepted'
        public array $metadata = []
    ) {
        // Capture the current authenticated user as the performer
        $this->metadata['performer'] = Auth::guard('tenant')->user();
        $this->metadata['performer_name'] = Auth::guard('tenant')->user()->name ?? 'Unknown User';
    }
}
