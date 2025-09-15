<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth', 'verified', 'tenant'])->group(function () {
    Route::prefix('{tenant}')->group(function () {
        Route::get('settings', function () {
            return redirect()->route('settings.general', ['tenant' => request()->route('tenant')]);
        });

        Route::get('settings/general', function () {
            return Inertia::render('settings/general');
        })->name('settings.general');

        Route::get('settings/security', function () {
            return Inertia::render('settings/security');
        })->name('settings.security');

        Route::get('settings/integrations', function () {
            return Inertia::render('settings/integrations');
        })->name('settings.integrations');

        Route::get('settings/billing', function () {
            return Inertia::render('settings/billing');
        })->name('settings.billing');

        Route::get('settings/team', function () {
            return Inertia::render('settings/team');
        })->name('settings.team');

        Route::get('settings/api-keys', function () {
            return Inertia::render('settings/api-keys');
        })->name('settings.api-keys');
    });
});
