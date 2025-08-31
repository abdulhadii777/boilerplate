<?php

use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Auth\InvitationController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\Settings\AppearanceController;
use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Tenant\DashboardController;

use App\Http\Controllers\Tenant\RolesController;
use App\Http\Controllers\Tenant\UsersController;
use Illuminate\Support\Facades\Route;

Route::get('/', [HomeController::class, 'index'])->name('home');
// Invitation acceptance routes (no auth required)
Route::get('/invitation/{token}', [InvitationController::class, 'show'])->name('invitation.accept');
Route::post('/invitation/{token}', [InvitationController::class, 'accept'])->name('invitation.accept.store');

// All tenant-scoped feature routes
Route::prefix('t/{tenant}')->middleware([
    'web',
    'auth',
    'tenant.init',
    'tenant.role',
])->group(function () {
    // Dashboard routes
    Route::get('/', [DashboardController::class, 'index'])->name('tenant.home');
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('tenant.dashboard');

    // Roles routes
    Route::get('/roles', [RolesController::class, 'index'])->name('tenant.roles.index');
    Route::post('/roles', [RolesController::class, 'store'])->name('tenant.roles.store');

    // Users routes
    Route::get('/users', [UsersController::class, 'index'])->name('tenant.users.index');
    Route::get('/users/create', [UsersController::class, 'create'])->name('tenant.users.create');
    Route::post('/users', [UsersController::class, 'store'])->name('tenant.users.store');
    Route::delete('/users/invitations/{invitation}', [UsersController::class, 'destroyInvitation'])->name('tenant.users.invitations.destroy');
    Route::delete('/users/{tenantUser}', [UsersController::class, 'destroyUser'])->name('tenant.users.destroy');



    // Settings routes
    Route::redirect('/settings', '/t/{tenant}/settings/profile');

    Route::get('/settings/profile', [ProfileController::class, 'edit'])->name('tenant.settings.profile');
    Route::patch('/settings/profile', [ProfileController::class, 'update'])->name('tenant.settings.profile.update');
    Route::delete('/settings/profile', [ProfileController::class, 'destroy'])->name('tenant.settings.profile.destroy');

    Route::get('/settings/password', [PasswordController::class, 'edit'])->name('tenant.settings.password');
    Route::put('/settings/password', [PasswordController::class, 'update'])->name('tenant.settings.password.update');

    Route::get('/settings/appearance', [AppearanceController::class, 'edit'])->name('tenant.settings.appearance');
    Route::patch('/settings/appearance', [ProfileController::class, 'update'])->name('tenant.settings.appearance.update');


});

require __DIR__.'/auth.php';
