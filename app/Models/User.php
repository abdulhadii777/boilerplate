<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * Always use the central database connection for users.
     */
    protected $connection = 'mysql';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Get the tenant relationships for this user.
     */
    public function tenantUsers(): HasMany
    {
        return $this->hasMany(TenantUser::class);
    }

    /**
     * Get the user's role in a specific tenant.
     */
    public function getTenantRole(string $tenantId): ?string
    {
        $tenantUser = $this->tenantUsers()->where('tenant_id', $tenantId)->first();
        return $tenantUser?->role;
    }

    /**
     * Check if user has access to a tenant.
     */
    public function hasAccessToTenant(string $tenantId): bool
    {
        return $this->tenantUsers()->where('tenant_id', $tenantId)->exists();
    }

    /**
     * Check if user has a specific role in a tenant.
     */
    public function hasTenantRole(string $tenantId, string $role): bool
    {
        return $this->tenantUsers()
            ->where('tenant_id', $tenantId)
            ->where('role', $role)
            ->exists();
    }

    /**
     * Check if user has any of the specified roles in a tenant.
     */
    public function hasAnyTenantRole(string $tenantId, array $roles): bool
    {
        return $this->tenantUsers()
            ->where('tenant_id', $tenantId)
            ->whereIn('role', $roles)
            ->exists();
    }
}
