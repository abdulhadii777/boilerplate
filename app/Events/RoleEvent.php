<?php

namespace App\Events;

use App\Models\Role;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Support\Facades\Auth;

class RoleEvent
{
    use Dispatchable, InteractsWithSockets;

    public function __construct(
        public Role $role,
        public string $action, // 'created', 'updated', 'deleted'
        public array $metadata = []
    ) {
        // Capture the current authenticated user as the performer
        $this->metadata['performer'] = Auth::guard('tenant')->user();
        $this->metadata['performer_name'] = Auth::guard('tenant')->user()->name ?? 'Unknown User';
    }
}
