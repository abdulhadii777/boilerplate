<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Stancl\Tenancy\Database\Concerns\CentralConnection;
use Stancl\Tenancy\Database\Concerns\ResourceSyncing;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Stancl\Tenancy\Contracts\SyncMaster;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use App\Models\Tenant;
use Stancl\Tenancy\Database\Models\TenantPivot;
use App\Models\TenantUser;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

/**
 * @property bool $is_disabled
 * @property string $status
 * @property bool $is_admin
 */
class CentralUser extends Authenticatable implements SyncMaster
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, CentralConnection, ResourceSyncing;

    protected $table = 'users';
    protected $guard_name = 'web';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'global_id',
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
     * The attributes that should be cast.
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

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($user) {
            if (empty($user->global_id)) {
                $user->global_id = Str::uuid();
            }
        });
    }

    public function tenants(): BelongsToMany
    {
        return $this->belongsToMany(Tenant::class, 'tenant_users', 'global_user_id', 'tenant_id', 'global_id')
            ->using(TenantPivot::class)
            ->withPivot('is_favorite');
    }

    /**
     * Get the user's favorite business
     */
    public function favoriteBusiness(): ?Tenant
    {
        return $this->tenants()->wherePivot('is_favorite', true)->first();
    }

    /**
     * Set a business as favorite (only one at a time)
     */
    public function setFavoriteBusiness(Tenant $tenant): bool
    {
        // First, remove favorite from all other businesses
        DB::table('tenant_users')
            ->where('global_user_id', $this->global_id)
            ->where('is_favorite', true)
            ->update(['is_favorite' => false]);

        // Then set the new favorite
        return $this->tenants()->updateExistingPivot($tenant->id, ['is_favorite' => true]);
    }

    /**
     * Remove favorite business
     */
    public function removeFavoriteBusiness(): bool
    {
        return DB::table('tenant_users')
            ->where('global_user_id', $this->global_id)
            ->where('is_favorite', true)
            ->update(['is_favorite' => false]) > 0;
    }

    /**
     * Check if a business is favorite
     */
    public function isFavoriteBusiness(Tenant $tenant): bool
    {
        return $this->tenants()
            ->wherePivot('tenant_id', $tenant->id)
            ->wherePivot('is_favorite', true)
            ->exists();
    }

    public function getTenantModelName(): string
    {
        return TenantUser::class;
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
        return static::class;
    }

    public function getSyncedAttributeNames(): array
    {
        return [
            'name',
            'email',
            'email_verified_at',
        ];
    }
}
