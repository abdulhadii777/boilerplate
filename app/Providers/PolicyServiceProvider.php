<?php

namespace App\Providers;

use App\Models\Role;
use App\Models\TenantUser;
use App\Policies\RolePolicy;
use App\Policies\UserPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class PolicyServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Gate::policy(Role::class, RolePolicy::class);
        Gate::policy(TenantUser::class, UserPolicy::class);
    }
}
