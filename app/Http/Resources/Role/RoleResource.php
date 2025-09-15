<?php

namespace App\Http\Resources\Role;

use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Spatie\Permission\Models\Permission;

/**
 * @mixin Role
 */
class RoleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description ?? null,
            'is_system' => $this->is_system,
            'permissions' => $this->when($this->relationLoaded('permissions'), function () {
                $permissions = $this->permissions->map(function (Permission $permission): array {
                    return [
                        'id' => $permission->id,
                        'name' => $permission->name,
                        'guard_name' => $permission->guard_name,
                    ];
                });

                return $permissions->toArray();
            }),
            'permissions_count' => $this->permissions_count ?? $this->permissions->count(),
            'users_count' => $this->users_count ?? 0,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
