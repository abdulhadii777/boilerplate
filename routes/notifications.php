<?php

use App\Http\Controllers\Notification\FirebaseTokenController;
use App\Http\Controllers\Notification\NotificationController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified','tenant'])->group(function () {
    Route::prefix('{tenant}/notifications')->name('notifications.')->group(function () {
        Route::get('/', [NotificationController::class, 'index'])->name('index');
        Route::post('/mark-read', [NotificationController::class, 'markAsRead'])->name('mark-read');
        Route::post('/mark-all-read', [NotificationController::class, 'markAllAsRead'])->name('mark-all-read');
        Route::get('/settings', [NotificationController::class, 'getSettings'])->name('settings');
        Route::put('/settings', [NotificationController::class, 'updateSettings'])->name('update-settings');

        Route::post('/save-fcm-token', [FirebaseTokenController::class, 'store'])->name('save-fcm-token');
        Route::get('/fcm-tokens', [FirebaseTokenController::class, 'index'])->name('fcm-tokens');
        Route::delete('/fcm-token', [FirebaseTokenController::class, 'destroy'])->name('delete-fcm-token');
    });
});
