<?php

namespace App\Providers;

use App\Services\ActivityLogService;
use Illuminate\Support\ServiceProvider;

class ActivityLogServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        $this->app->singleton(ActivityLogService::class, function ($app) {
            return new ActivityLogService;
        });
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        // Register the service provider to handle deferred logging
        $this->app->singleton('activity.log', function ($app) {
            return $app->make(ActivityLogService::class);
        });
    }
}
