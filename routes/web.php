<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified', 'tenant'])->group(function () {
    Route::get('/{tenant}/dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

require __DIR__.'/auth.php';
require __DIR__.'/business.php';
require __DIR__.'/manage-profile.php';
require __DIR__.'/settings.php';
require __DIR__.'/roles.php';
require __DIR__.'/users.php';
require __DIR__.'/notifications.php';
require __DIR__.'/activity-logs.php';
