<?php

namespace App\Http\Resources\User;

use App\Models\TenantUser;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin TenantUser
 */
class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'is_admin' => $this->hasRole('Admin'),
            'is_disabled' => $this->is_disabled,
            'status' => $this->status,
            'avatar' => $this->avatar,
            'email_verified_at' => $this->email_verified_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'role' => $this->when($this->relationLoaded('roles'), function () {
                $role = $this->roles->first();

                return $role ? [
                    'id' => $role->id,
                    'name' => $role->name,
                ] : null;
            }),
            'roles' => $this->when($this->relationLoaded('roles'), function () {
                return $this->roles->map(function ($role) {
                    return [
                        'id' => $role->id,
                        'name' => $role->name,
                        'description' => $role->description,
                        'is_system' => $role->is_system,
                    ];
                });
            }),
        ];
    }
}
