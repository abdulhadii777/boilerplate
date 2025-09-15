<?php

namespace App\Providers;

use App\Models\Invite;
use App\Models\Role;
use App\Models\TenantUser;
use App\Observers\InviteObserver;
use App\Observers\RoleObserver;
use App\Observers\UserObserver;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\ServiceProvider;
use Stancl\Tenancy\Middleware\InitializeTenancyByPath;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        InitializeTenancyByPath::$onFail = function ($exception, $request, $next) {
            return redirect()->route('business.index');            
        };
        
        TenantUser::observe(UserObserver::class);
        Role::observe(RoleObserver::class);
        Invite::observe(InviteObserver::class);
    }
}
