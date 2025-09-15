<?php

use App\Http\Controllers\Logging\ActivityLogController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified','tenant'])->group(function () {
    Route::get('/{tenant}/activity-logs', [ActivityLogController::class, 'index'])->name('activity-logs.index');
});
