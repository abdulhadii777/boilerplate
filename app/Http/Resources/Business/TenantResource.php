<?php

namespace App\Http\Resources\Business;

use App\Models\Tenant;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Tenant
 */
class TenantResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'user_count' => $this->when($this->relationLoaded('users'), function () {
                return $this->users->count();
            }),
            'is_current' => $this->when(isset($this->is_current), $this->is_current),
            'is_favorite' => $this->pivot->is_favorite ?? false,
        ];
    }
}
