<?php

use App\Http\Controllers\BusinessController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/business', [BusinessController::class, 'index'])->name('business.index');
    Route::post('/business', [BusinessController::class, 'store'])->name('business.store');
    Route::put('/business/{tenant}', [BusinessController::class, 'update'])->name('business.update');
    Route::delete('/business/{tenant}', [BusinessController::class, 'destroy'])->name('business.destroy');
    Route::post('/business/{tenant}/switch', [BusinessController::class, 'switch'])->name('business.switch');
    Route::post('/business/{tenant}/toggle-favorite', [BusinessController::class, 'toggleFavorite'])->name('business.toggle-favorite');
});
