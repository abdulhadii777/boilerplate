<?php

namespace App\Models;

use Spatie\Permission\Models\Role;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class TenantRole extends Role
{
    protected $connection = 'tenant';

    protected $fillable = [
        'name',
        'display_name',
        'description',
        'guard_name',
    ];

    /**
     * Get the permissions for the role.
     */
    public function permissions(): BelongsToMany
    {
        return $this->belongsToMany(
            TenantPermission::class,
            'role_has_permissions',
            'role_id',
            'permission_id'
        );
    }
}
