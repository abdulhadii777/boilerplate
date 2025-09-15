<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NotificationSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'event_type',
        'email_enabled',
        'push_enabled',
        'in_app_enabled',
    ];

    protected $casts = [
        'email_enabled' => 'boolean',
        'push_enabled' => 'boolean',
        'in_app_enabled' => 'boolean',
    ];

    /**
     * Get the user that owns the notification setting
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(TenantUser::class, 'user_id');
    }

    /**
     * Check if email notifications are enabled for this event
     */
    public function isEmailEnabled(): bool
    {
        return $this->email_enabled;
    }

    /**
     * Check if push notifications are enabled for this event
     */
    public function isPushEnabled(): bool
    {
        return $this->push_enabled;
    }

    /**
     * Check if in-app notifications are enabled for this event
     */
    public function isInAppEnabled(): bool
    {
        return $this->in_app_enabled;
    }

    /**
     * Get all available event types
     */
    public static function getAvailableEventTypes(): array
    {
        return [
            // User events
            'user_invited' => 'User Invited',
            'user_role_updated' => 'User Role Updated',
            'user_disabled' => 'User Disabled',
            'user_enabled' => 'User Enabled',
            'user_deleted' => 'User Deleted',

            // Role events
            'role_created' => 'Role Created',
            'role_updated' => 'Role Updated',
            'role_deleted' => 'Role Deleted',

            // Invite events
            'invite_sent' => 'Invite Sent',
            'invite_cancelled' => 'Invite Cancelled',
            'invite_resent' => 'Invite Resent',
        ];
    }

    /**
     * Get user's notification settings for a specific event type
     */
    public static function getUserSettingsForEvent(int $userId, string $eventType): ?self
    {
        return static::where('user_id', $userId)
            ->where('event_type', $eventType)
            ->first();
    }
}
