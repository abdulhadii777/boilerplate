<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ActivityLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'feature',
        'action',
        'details',
        'performed_by',
        'performed_at',
    ];

    protected $casts = [
        'performed_at' => 'datetime',
    ];

    /**
     * Get the user who performed the action
     */
    public function performer(): BelongsTo
    {
        return $this->belongsTo(TenantUser::class, 'performed_by');
    }

    /**
     * Scope to filter by feature
     */
    public function scopeForFeature($query, string $feature)
    {
        return $query->where('feature', $feature);
    }

    /**
     * Scope to filter by action
     */
    public function scopeForAction($query, string $action)
    {
        return $query->where('action', $action);
    }

    /**
     * Scope to filter by user
     */
    public function scopeByUser($query, int $userId)
    {
        return $query->where('performed_by', $userId);
    }

    /**
     * Scope to filter by date range
     */
    public function scopeInDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('performed_at', [$startDate, $endDate]);
    }
}
