<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\StatementOfAccountController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('FrontPage');
})->name('front');

// Public CSRF token refresh endpoint
Route::get('/csrf-token', function() {
    return response()->json([
        'token' => csrf_token()
    ]);
});


Route::get('/statement-of-account', function () {
    return Inertia::render('StatementOfAccount');
})->middleware(['auth', 'verified'])->name('statement-of-account');

Route::get('/saved-statements', function () {
    return Inertia::render('SavedStatements');
})->middleware(['auth', 'verified'])->name('saved-statements');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Statement of Account API routes (with CSRF protection)
Route::middleware(['web'])->group(function () {
    Route::get('/api/statements', [StatementOfAccountController::class, 'index'])->middleware(['auth', 'verified']);
    Route::get('/api/statements/all', [StatementOfAccountController::class, 'indexAll'])->middleware(['auth', 'verified']);
    Route::post('/api/statements', [StatementOfAccountController::class, 'store'])->middleware(['auth', 'verified']);
    Route::post('/api/statements/multiple', [StatementOfAccountController::class, 'storeMultiple'])->middleware(['auth', 'verified']);
    Route::get('/api/statements/{id}', [StatementOfAccountController::class, 'show'])->middleware(['auth', 'verified']);
    Route::put('/api/statements/{id}', [StatementOfAccountController::class, 'update'])->middleware(['auth', 'verified']);
    Route::delete('/api/statements/{id}', [StatementOfAccountController::class, 'destroy'])->middleware(['auth', 'verified']);
    
    // Session refresh route
    Route::get('/api/refresh-csrf', function() {
        return response()->json([
            'csrf_token' => csrf_token()
        ]);
    })->middleware(['auth', 'verified']);
});

// Admin routes
Route::middleware(['web', 'auth'])->group(function () {
    Route::get('/admin/dashboard', [AdminController::class, 'dashboard'])->name('admin.dashboard');
    Route::post('/admin/users/{user}/approve', [AdminController::class, 'approveUser'])->name('admin.users.approve');
    Route::post('/admin/users/{user}/decline', [AdminController::class, 'declineUser'])->name('admin.users.decline');
    Route::get('/admin/pending-count', [AdminController::class, 'getPendingCount'])->name('admin.pending-count');
});

require __DIR__.'/auth.php';
