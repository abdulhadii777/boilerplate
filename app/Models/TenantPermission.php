<?php

namespace App\Models;

use Spatie\Permission\Models\Permission;

class TenantPermission extends Permission
{
    protected $connection = 'tenant';

    protected $fillable = [
        'name',
        'guard_name',
    ];
}
