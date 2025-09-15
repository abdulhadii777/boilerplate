<?php

namespace App\Observers;

use App\Events\RoleEvent;
use App\Models\Role;

class RoleObserver
{
    /**
     * Handle the Role "created" event.
     */
    public function created(Role $role): void
    {
        event(new RoleEvent($role, 'created'));
    }

    /**
     * Handle the Role "updated" event.
     */
    public function updated(Role $role): void
    {
        event(new RoleEvent($role, 'updated'));
    }

    /**
     * Handle the Role "deleted" event.
     */
    public function deleted(Role $role): void
    {
        event(new RoleEvent($role, 'deleted'));
    }
}
