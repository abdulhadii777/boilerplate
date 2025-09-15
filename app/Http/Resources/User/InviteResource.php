<?php

namespace App\Http\Resources\User;

use App\Models\Invite;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Invite
 */
class InviteResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'email' => $this->email,
            'resent_count' => $this->resent_count,
            'accepted_at' => $this->accepted_at,
            'expires_at' => $this->expires_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'status' => $this->status,
            'can_resend' => $this->canBeResent(),
            'can_cancel' => $this->canBeCancelled(),
            'role' => $this->when($this->relationLoaded('role'), function () {
                return $this->role ? [
                    'id' => $this->role->id,
                    'name' => $this->role->name,
                ] : null;
            }),
        ];
    }
}
