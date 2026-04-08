<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\StatementOfAccountController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('FrontPage');
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
    Route::get('/api/statements', [StatementOfAccountController::class, 'index'])->middleware('auth');
    Route::get('/api/statements/all', [StatementOfAccountController::class, 'indexAll'])->middleware('auth');
    Route::post('/api/statements', [StatementOfAccountController::class, 'store'])->middleware('auth');
    Route::post('/api/statements/multiple', [StatementOfAccountController::class, 'storeMultiple'])->middleware('auth');
    Route::get('/api/statements/{id}', [StatementOfAccountController::class, 'show'])->middleware('auth');
    Route::put('/api/statements/{id}', [StatementOfAccountController::class, 'update'])->middleware('auth');
    Route::delete('/api/statements/{id}', [StatementOfAccountController::class, 'destroy'])->middleware('auth');
    
    // Session refresh route
    Route::get('/api/refresh-csrf', function() {
        return response()->json([
            'csrf_token' => csrf_token()
        ]);
    })->middleware('auth');
});

require __DIR__.'/auth.php';
