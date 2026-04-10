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
    echo "=== Simple Registration Debug ===\n";
    
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
    
    // Step 1: Test if we can create a user and send email
    echo "\n1. Testing user creation and email sending...\n";
    
    $testEmail = 'simple-debug-' . time() . '@gmail.com';
    
    // Create user
    $user = User::create([
        'name' => 'Simple Debug User',
        'email' => $testEmail,
        'password' => bcrypt('TestPass123!'),
    ]);
    
    echo "User created: $testEmail\n";
    echo "User ID: " . $user->id . "\n";
    
    // Send verification email manually
    try {
        $user->sendEmailVerificationNotification();
        echo "Verification email sent successfully!\n";
    } catch (Exception $e) {
        echo "Failed to send verification email: " . $e->getMessage() . "\n";
    }
    
    // Step 2: Test direct mail
    echo "\n2. Testing direct mail sending...\n";
    
    try {
        Mail::raw('Direct test email at ' . date('H:i:s'), function($message) use ($testEmail) {
            $message->to($testEmail)
                    ->subject('Direct Test - ' . date('H:i:s'))
                    ->from('treasuryapp0@gmail.com', 'Treasury Office');
        });
        echo "Direct email sent successfully!\n";
    } catch (Exception $e) {
        echo "Direct email failed: " . $e->getMessage() . "\n";
    }
    
    // Cleanup
    $user->delete();
    echo "\nTest user deleted.\n";
    
    echo "\n=== Debug Complete ===\n";
    echo "If both emails were sent, the issue is in the frontend form submission.\n";
    echo "If emails failed, there's a Gmail configuration issue.\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . ":" . $e->getLine() . "\n";
}
