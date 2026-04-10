<?php

// Bootstrap Laravel
require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Mail;

try {
    echo "=== Gmail Configuration Fix ===\n";
    
    // Check current settings
    echo "Current settings:\n";
    echo "MAIL_MAILER: " . env('MAIL_MAILER') . "\n";
    echo "MAIL_HOST: " . env('MAIL_HOST') . "\n";
    echo "MAIL_PORT: " . env('MAIL_PORT') . "\n";
    echo "MAIL_ENCRYPTION: " . env('MAIL_ENCRYPTION') . "\n";
    echo "MAIL_USERNAME: " . env('MAIL_USERNAME') . "\n";
    echo "MAIL_PASSWORD: " . env('MAIL_PASSWORD') . "\n";
    echo "MAIL_FROM_ADDRESS: " . env('MAIL_FROM_ADDRESS') . "\n";
    
    // Fix 1: Update mail configuration to use correct Gmail settings
    echo "\nFixing mail configuration...\n";
    
    // Set correct Gmail SMTP settings
    config([
        'mail.mailers.smtp.host' => 'smtp.gmail.com',
        'mail.mailers.smtp.port' => 587,
        'mail.mailers.smtp.encryption' => 'tls',
        'mail.mailers.smtp.username' => 'treasuryapp0@gmail.com',
        'mail.mailers.smtp.password' => 'bdeuraqtogavrvrw',
        'mail.from.address' => 'treasuryapp0@gmail.com',
        'mail.from.name' => 'Treasury Office'
    ]);
    
    echo "Updated configuration:\n";
    echo "Host: " . config('mail.mailers.smtp.host') . "\n";
    echo "Port: " . config('mail.mailers.smtp.port') . "\n";
    echo "Encryption: " . config('mail.mailers.smtp.encryption') . "\n";
    echo "Username: " . config('mail.mailers.smtp.username') . "\n";
    echo "From: " . config('mail.from.address') . "\n";
    
    // Fix 2: Test with different email formats
    echo "\nTesting different email formats...\n";
    
    // Test 1: Simple text email
    try {
        Mail::raw('Test 1 - Simple text email at ' . date('H:i:s'), function($message) {
            $message->to('treasuryapp0@gmail.com')
                    ->subject('Test 1 - Simple - ' . date('H:i:s'))
                    ->from('treasuryapp0@gmail.com', 'Treasury Office');
        });
        echo "Test 1 (simple text): SUCCESS\n";
    } catch (Exception $e) {
        echo "Test 1 failed: " . $e->getMessage() . "\n";
    }
    
    // Test 2: HTML email
    try {
        Mail::send([], [], function($message) {
            $message->to('treasuryapp0@gmail.com')
                    ->subject('Test 2 - HTML - ' . date('H:i:s'))
                    ->from('treasuryapp0@gmail.com', 'Treasury Office')
                    ->setBody('<h1>HTML Test Email</h1><p>This is a test at ' . date('H:i:s') . '</p>', 'text/html');
        });
        echo "Test 2 (HTML): SUCCESS\n";
    } catch (Exception $e) {
        echo "Test 2 failed: " . $e->getMessage() . "\n";
    }
    
    // Test 3: Different subject
    try {
        Mail::raw('Test 3 - Different subject at ' . date('H:i:s'), function($message) {
            $message->to('treasuryapp0@gmail.com')
                    ->subject('IMPORTANT: Treasury App Test Email')
                    ->from('treasuryapp0@gmail.com', 'Treasury Office');
        });
        echo "Test 3 (different subject): SUCCESS\n";
    } catch (Exception $e) {
        echo "Test 3 failed: " . $e->getMessage() . "\n";
    }
    
    // Test 4: Send to both addresses
    try {
        Mail::raw('Test 4 - Multiple recipients at ' . date('H:i:s'), function($message) {
            $message->to(['treasuryapp0@gmail.com', 'jpacamalan404@gmail.com'])
                    ->subject('Test 4 - Multiple - ' . date('H:i:s'))
                    ->from('treasuryapp0@gmail.com', 'Treasury Office');
        });
        echo "Test 4 (multiple recipients): SUCCESS\n";
    } catch (Exception $e) {
        echo "Test 4 failed: " . $e->getMessage() . "\n";
    }
    
    // Fix 3: Check if we need to use a different port
    echo "\nTesting with port 465 (SSL)...\n";
    
    config([
        'mail.mailers.smtp.port' => 465,
        'mail.mailers.smtp.encryption' => 'ssl'
    ]);
    
    try {
        Mail::raw('Test 5 - Port 465 SSL at ' . date('H:i:s'), function($message) {
            $message->to('treasuryapp0@gmail.com')
                    ->subject('Test 5 - SSL 465 - ' . date('H:i:s'))
                    ->from('treasuryapp0@gmail.com', 'Treasury Office');
        });
        echo "Test 5 (port 465 SSL): SUCCESS\n";
    } catch (Exception $e) {
        echo "Test 5 failed: " . $e->getMessage() . "\n";
    }
    
    // Restore original settings
    config([
        'mail.mailers.smtp.port' => 587,
        'mail.mailers.smtp.encryption' => 'tls'
    ]);
    
    echo "\n=== Gmail Configuration Complete ===\n";
    echo "If you're still not receiving emails, check:\n";
    echo "1. Gmail spam folder\n";
    echo "2. Gmail promotions/social tabs\n";
    echo "3. Gmail forwarding settings\n";
    echo "4. Try generating a new app password\n";
    echo "5. Make sure 2FA is enabled on the Gmail account\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}
