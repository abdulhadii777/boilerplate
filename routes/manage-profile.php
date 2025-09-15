<?php

use App\Http\Controllers\ManageProfile\NotificationController;
use App\Http\Controllers\ManageProfile\PasswordController;
use App\Http\Controllers\ManageProfile\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth', 'verified','tenant'])->group(function () {
    Route::prefix('{tenant}')->group(function () {
        Route::redirect('manage-profile', '/manage-profile/profile');

        Route::get('manage-profile/profile', [ProfileController::class, 'edit'])->name('profile.edit');
        Route::patch('manage-profile/profile', [ProfileController::class, 'update'])->name('profile.update');
        Route::delete('manage-profile/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

        Route::get('manage-profile/password', [PasswordController::class, 'edit'])->name('password.edit');

        Route::put('manage-profile/password', [PasswordController::class, 'update'])
            ->middleware('throttle:6,1')
            ->name('password.update');

        Route::get('manage-profile/notifications', [NotificationController::class, 'edit'])->name('notifications');

        Route::get('manage-profile/appearance', function () {
            return Inertia::render('manage-profile/appearance');
        })->name('appearance');
    });
});
