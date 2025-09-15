<?php

namespace App\Events;

use App\Models\TenantUser;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Support\Facades\Auth;

class UserEvent
{
    use Dispatchable, InteractsWithSockets;

    public function __construct(
        public TenantUser $user,
        public string $action, // 'invited', 'role_updated', 'disabled', 'enabled', 'deleted'
        public array $metadata = []
    ) {
        // Capture the current authenticated user as the performer
        $this->metadata['performer'] = Auth::guard('tenant')->user();
        $this->metadata['performer_name'] = Auth::guard('tenant')->user()->name ?? 'Unknown User';
    }
}
