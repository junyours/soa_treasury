<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;

try {
    echo "=== Cleaning Up All Test Users ===\n";
    
    // Delete all test/debug users
    $testUsers = User::where('name', 'like', 'Debug%')
                      ->orWhere('name', 'like', 'Verification%')
                      ->orWhere('email', 'like', '%test%')
                      ->orWhere('email', 'like', 'debug%')
                      ->orWhere('email', 'like', 'verification%')
                      ->get();
    
    echo "Found " . $testUsers->count() . " test users\n";
    
    foreach ($testUsers as $user) {
        echo "Deleting user: " . $user->name . " (" . $user->email . ") - Verified: " . ($user->hasVerifiedEmail() ? 'Yes' : 'No') . "\n";
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
