<?php

namespace App\Http\Resources\Logging;

use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin ActivityLog
 */
class ActivityLogResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'feature' => $this->feature,
            'action' => $this->action,
            'details' => $this->details,
            'performed_by' => $this->performed_by,
            'performed_at' => $this->performed_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'performer' => $this->when($this->relationLoaded('performer'), function () {
                return $this->performer ? [
                    'id' => $this->performer->id,
                    'name' => $this->performer->name,
                    'email' => $this->performer->email,
                ] : null;
            }),
        ];
    }
}
