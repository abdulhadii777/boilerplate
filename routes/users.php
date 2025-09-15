<?php

use App\Http\Controllers\User\InviteAcceptanceController;
use App\Http\Controllers\User\UserController;
use App\Http\Controllers\User\UserInviteController;
use Illuminate\Support\Facades\Route;

// User management routes (Admin only)
Route::middleware(['auth', 'verified', 'tenant'])->group(function () {
    Route::prefix('{tenant}')->group(function () {
        Route::get('/users', [UserController::class, 'index'])->name('users.index');
        Route::put('/users/{userId}/role', [UserController::class, 'updateRole'])->name('users.updateRole');
        Route::put('/users/{userId}/disable', [UserController::class, 'disable'])->name('users.disable');
        Route::put('/users/{userId}/enable', [UserController::class, 'enable'])->name('users.enable');
        Route::delete('/users/{userId}', [UserController::class, 'destroy'])->name('users.destroy');
        Route::post('/users/invite', [UserInviteController::class, 'store'])->name('users.invite');
        Route::post('/invites/{inviteId}/resend', [UserInviteController::class, 'resend'])->name('invites.resend');
        Route::delete('/invites/{inviteId}', [UserInviteController::class, 'cancel'])->name('invites.cancel');
    });
});

// Invite acceptance routes (public - accessible to both guests and authenticated users)
Route::middleware(['tenant'])->group(function () {
    Route::get('{tenant}/invites/accept/{token}', [InviteAcceptanceController::class, 'show'])->name('invites.accept.show');
    Route::post('{tenant}/invites/accept', [InviteAcceptanceController::class, 'store'])->name('invites.accept.store');
});
