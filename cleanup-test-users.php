<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;

try {
    echo "=== Cleaning Up Test Users ===\n";
    
    // Delete test users
    $testUsers = User::where('email', 'like', 'test%@example.com')
                      ->orWhere('email', 'like', 'test%@gmail.com')
                      ->orWhere('name', 'like', 'Test%')
                      ->get();
    
    echo "Found " . $testUsers->count() . " test users\n";
    
    foreach ($testUsers as $user) {
        echo "Deleting user: " . $user->email . " (ID: " . $user->id . ")\n";
        $user->delete();
    }
    
    echo "Test users cleaned up successfully!\n";
    
    // Show remaining users
    $remainingUsers = User::all();
    echo "Remaining users: " . $remainingUsers->count() . "\n";
    
    foreach ($remainingUsers as $user) {
        echo "- " . $user->name . " (" . $user->email . ") - Verified: " . ($user->hasVerifiedEmail() ? 'Yes' : 'No') . "\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
