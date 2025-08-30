<?php

use App\Http\Controllers\Tenant\DashboardController;
use App\Http\Controllers\Tenant\RolesController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\AppearanceController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('dashboard/welcome');
})->name('home');

// All tenant-scoped feature routes
Route::prefix('t/{tenant}')->middleware([
    'web',
    'auth',
    'tenant.init',
    'tenant.role',
])->group(function () {
    // Dashboard routes
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('tenant.dashboard');

    // Roles routes
    Route::get('/roles', [RolesController::class, 'index'])->name('tenant.roles.index');
    Route::post('/roles', [RolesController::class, 'store'])->name('tenant.roles.store');

    // Settings routes
    Route::redirect('/settings', '/t/{tenant}/settings/profile');
    
    Route::get('/settings/profile', [ProfileController::class, 'edit'])->name('tenant.settings.profile');
    Route::patch('/settings/profile', [ProfileController::class, 'update'])->name('tenant.settings.profile.update');
    Route::delete('/settings/profile', [ProfileController::class, 'destroy'])->name('tenant.settings.profile.destroy');

    Route::get('/settings/password', [PasswordController::class, 'edit'])->name('tenant.settings.password');
    Route::put('/settings/password', [PasswordController::class, 'update'])->name('tenant.settings.password.update');

    Route::get('/settings/appearance', [AppearanceController::class, 'edit'])->name('tenant.settings.appearance');
    Route::patch('/settings/appearance', [AppearanceController::class, 'update'])->name('tenant.settings.appearance.update');
});

require __DIR__.'/auth.php';
