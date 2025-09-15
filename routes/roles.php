<?php

use App\Http\Controllers\Role\RoleController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified','tenant'])->group(function () {
    Route::prefix('{tenant}')->group(function () {
        Route::resource('roles', RoleController::class)->except(['show']);
        Route::post('roles/{role}/copy', [RoleController::class, 'copy'])->name('roles.copy');
    });
});
