<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Stancl\Tenancy\Contracts\TenantWithDatabase;
use Stancl\Tenancy\Database\Concerns\HasDatabase;
use Stancl\Tenancy\Database\Concerns\HasDomains;
use Stancl\Tenancy\Database\Models\Tenant as BaseTenant;
use Stancl\Tenancy\DatabaseConfig;

class Tenant extends BaseTenant implements TenantWithDatabase
{
    use HasDatabase, HasDomains, HasUuids;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'id',
        'data',
    ];

    /**
     * Get the name of the tenant for display purposes.
     */
    public function getNameAttribute(): string
    {
        return ucfirst(str_replace(['-', '_'], ' ', $this->id));
    }

    /**
     * Get the database configuration for this tenant.
     */
    public function database(): DatabaseConfig
    {
        return new DatabaseConfig($this);
    }
}