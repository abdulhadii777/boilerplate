<?php

namespace App\Models;

use Spatie\Permission\Traits\HasRoles;
use Stancl\Tenancy\Contracts\Syncable;
use Stancl\Tenancy\Database\Concerns\TenantConnection;
use Stancl\Tenancy\Database\Concerns\ResourceSyncing;   
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use App\Models\CentralUser;

class TenantUser extends  Authenticatable implements Syncable
{
    use TenantConnection, HasRoles, ResourceSyncing, Notifiable;

    protected $table = 'users';
    protected $guard_name = 'tenant';

    protected $fillable = [
        'global_id',
        'name',
        'email',
        'email_verified_at',
        'is_disabled',
        'is_favorite',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'is_disabled' => 'boolean',
        'is_favorite' => 'boolean',
    ];
    
    /**
     * The accessors to append to the model's array form.
     *
     * @var list<string>
     */
    protected $appends = ['status'];

    public function invites()
    {
        return $this->hasMany(Invite::class, 'email', 'email');
    }
    
    /**
     * Get the calculated status of the user
     */
    public function getStatusAttribute(): string
    {
        if ($this->is_disabled) {
            return 'inactive';
        }

        return 'active';
    }

    /**
     * Scope to get only active users
     */
    public function scopeActive($query)
    {
        return $query->where('is_disabled', false);
    }

    /**
     * Scope to get only disabled users
     */
    public function scopeDisabled($query)
    {
        return $query->where('is_disabled', true);
    }

    /**
     * Check if user is disabled
     */
    public function isDisabled(): bool
    {
        return $this->is_disabled;
    }

    /**
     * Check if user is active
     */
    public function isActive(): bool
    {
        return ! $this->is_disabled;
    }
    
    /**
     * Get the user's notification settings
     */
    public function notificationSettings()
    {
        return $this->hasMany(NotificationSetting::class, 'user_id');
    }

    /**
     * Get the user's Firebase tokens
     */
    public function firebaseTokens()
    {
        return $this->hasMany(FirebaseToken::class, 'user_id');
    }

    /**
     * Get the user's notifications
     */
    public function notifications()
    {
        return $this->morphMany(Notification::class, 'notifiable');
    }
    
    
    /**
     * Get the user's unread notifications
     */
    public function unreadNotifications()
    {
        return $this->morphMany(Notification::class, 'notifiable')->unread();
    }

    /**
     * Get the notification routing information for the FCM channel.
     */
    public function routeNotificationForFcm($notification): array
    {
        $tokens = $this->firebaseTokens()
            ->where('is_active', true)
            ->pluck('token')
            ->toArray();

        return $tokens;
    }

    public function getGlobalIdentifierKey()
    {
        return $this->getAttribute($this->getGlobalIdentifierKeyName());
    }

    public function getGlobalIdentifierKeyName(): string
    {
        return 'global_id';
    }

    public function getCentralModelName(): string
    {
        return CentralUser::class;
    }

    public function getSyncedAttributeNames(): array
    {
        return [
            'global_id',
            'name',
            'email',
            'email_verified_at',
        ];
    }
}