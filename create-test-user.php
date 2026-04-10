<?php

// Bootstrap Laravel
require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Config;
use App\Models\User;

try {
    echo "=== Create Test User ===\n";
    
    // Force correct configuration
    Config::set('mail.default', 'smtp');
    Config::set('mail.mailers.smtp.host', 'smtp.gmail.com');
    Config::set('mail.mailers.smtp.port', 587);
    Config::set('mail.mailers.smtp.encryption', 'tls');
    Config::set('mail.mailers.smtp.username', 'treasuryapp0@gmail.com');
    Config::set('mail.mailers.smtp.password', 'bdeuraqtogavrvrw');
    Config::set('mail.from.address', 'treasuryapp0@gmail.com');
    Config::set('mail.from.name', 'Treasury Office');
    
    echo "Gmail configuration set\n";
    
    // Create a test user
    $testEmail = 'manual-test-' . time() . '@gmail.com';
    $user = User::create([
        'name' => 'Manual Test User',
        'email' => $testEmail,
        'password' => bcrypt('simplepass'),
    ]);
    
    echo "User created: $testEmail\n";
    echo "User ID: " . $user->id . "\n";
    
    // Send verification email
    try {
        $user->sendEmailVerificationNotification();
        echo "Verification email sent to: $testEmail\n";
    } catch (Exception $e) {
        echo "Failed to send verification: " . $e->getMessage() . "\n";
    }
    
    // Generate verification URL
    $verificationUrl = \Illuminate\Support\Facades\URL::temporarySignedRoute(
        'verification.verify',
        now()->addMinutes(60),
        [
            'id' => $user->getKey(),
            'hash' => sha1($user->getEmailForVerification()),
        ],
        false
    );
    
    echo "\nVerification URL: $verificationUrl\n";
    echo "Full URL: http://localhost:8000$verificationUrl\n";
    
    echo "\n=== Test Instructions ===\n";
    echo "1. Copy the full URL above\n";
    echo "2. Paste it in your browser\n";
    echo "3. Check if verification works\n";
    echo "4. Check Laravel logs for debugging\n";
    echo "5. User will be deleted after testing\n";
    
    echo "\nUser ID for cleanup: " . $user->id . "\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . ":" . $e->getLine() . "\n";
}
