<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

/**
 * @property int $id
 * @property string $email
 * @property int $role_id
 * @property string $token
 * @property int $resent_count
 * @property \Carbon\Carbon|null $accepted_at
 * @property \Carbon\Carbon|null $expires_at
 * @property int|null $invited_by
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 * @property-read Role $role
 * @property-read User|null $invitedBy
 * @property-read User|null $user
 */
class Invite extends Model
{
    use HasFactory;

    protected $fillable = [
        'email',
        'role_id',
        'token',
        'resent_count',
        'accepted_at',
        'expires_at',
        'invited_by',
    ];

    protected $casts = [
        'accepted_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($invite) {
            if (empty($invite->token)) {
                $invite->token = Str::random(64);
            }
        });
    }

    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    public function invitedBy(): BelongsTo
    {
        return $this->belongsTo(TenantUser::class, 'invited_by');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(TenantUser::class, 'email', 'email');
    }

    public function isExpired(): bool
    {
        return $this->expires_at && $this->expires_at->isPast();
    }

    public function isAccepted(): bool
    {
        return $this->accepted_at !== null;
    }

    public function isPending(): bool
    {
        return $this->accepted_at === null;
    }

    public function canBeResent(): bool
    {
        return $this->resent_count < 3;
    }

    public function canBeCancelled(): bool
    {
        return $this->isPending() && !$this->isExpired();
    }
}
