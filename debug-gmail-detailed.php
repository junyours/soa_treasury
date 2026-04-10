<?php

// Bootstrap Laravel
require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

try {
    echo "=== Detailed Gmail Debug ===\n";
    
    // Check current configuration
    echo "Current Gmail Settings:\n";
    echo "Username: " . config('mail.mailers.smtp.username') . "\n";
    echo "Password length: " . strlen(config('mail.mailers.smtp.password')) . " characters\n";
    echo "Host: " . config('mail.mailers.smtp.host') . "\n";
    echo "Port: " . config('mail.mailers.smtp.port') . "\n";
    echo "Encryption: " . config('mail.mailers.smtp.encryption') . "\n";
    echo "From: " . config('mail.from.address') . "\n";
    
    // Test 1: Try with different Gmail SMTP settings
    echo "\n1. Testing with port 465 (SSL)...\n";
    
    // Temporarily change config
    $originalPort = config('mail.mailers.smtp.port');
    $originalEncryption = config('mail.mailers.smtp.encryption');
    
    config(['mail.mailers.smtp.port' => 465]);
    config(['mail.mailers.smtp.encryption' => 'ssl']);
    
    try {
        Mail::raw('Test via port 465 SSL at ' . date('H:i:s'), function($message) {
            $message->to('treasuryapp0@gmail.com')
                    ->subject('Test 465 SSL - ' . date('H:i:s'))
                    ->from(config('mail.from.address'), config('mail.from.name'));
        });
        echo "Email sent via port 465 SSL successfully!\n";
    } catch (Exception $e) {
        echo "Port 465 SSL failed: " . $e->getMessage() . "\n";
    }
    
    // Restore original settings
    config(['mail.mailers.smtp.port' => $originalPort]);
    config(['mail.mailers.smtp.encryption' => $originalEncryption]);
    
    // Test 2: Try without encryption
    echo "\n2. Testing without encryption...\n";
    
    config(['mail.mailers.smtp.encryption' => null]);
    
    try {
        Mail::raw('Test without encryption at ' . date('H:i:s'), function($message) {
            $message->to('treasuryapp0@gmail.com')
                    ->subject('Test No Encryption - ' . date('H:i:s'))
                    ->from(config('mail.from.address'), config('mail.from.name'));
        });
        echo "Email sent without encryption successfully!\n";
    } catch (Exception $e) {
        echo "No encryption failed: " . $e->getMessage() . "\n";
    }
    
    // Restore encryption
    config(['mail.mailers.smtp.encryption' => $originalEncryption]);
    
    // Test 3: Check if the app password is correct format
    echo "\n3. Checking app password format...\n";
    $password = config('mail.mailers.smtp.password');
    echo "Password: " . $password . "\n";
    echo "Length: " . strlen($password) . "\n";
    
    if (strlen($password) !== 16) {
        echo "WARNING: Gmail app passwords should be exactly 16 characters!\n";
        echo "Current password is " . strlen($password) . " characters.\n";
    }
    
    // Test 4: Try with a different from address
    echo "\n4. Testing with different from address...\n";
    
    try {
        Mail::raw('Test with different from at ' . date('H:i:s'), function($message) {
            $message->to('treasuryapp0@gmail.com')
                    ->subject('Test Different From - ' . date('H:i:s'))
                    ->from('treasuryapp0@gmail.com', 'Treasury App'); // Same as username
        });
        echo "Email sent with different from address successfully!\n";
    } catch (Exception $e) {
        echo "Different from address failed: " . $e->getMessage() . "\n";
    }
    
    // Test 5: Log the attempt
    echo "\n5. Logging email attempt...\n";
    Log::info('Email test attempted at ' . date('Y-m-d H:i:s') . ' to treasuryapp0@gmail.com');
    
    // Test 6: Try using PHPMailer directly (if available)
    echo "\n6. Testing alternative mail method...\n";
    
    try {
        // Use Laravel's built-in logging to verify mail system
        config(['mail.default' => 'log']);
        
        Mail::raw('This should go to log file', function($message) {
            $message->to('treasuryapp0@gmail.com')
                    ->subject('Log Test - ' . date('H:i:s'))
                    ->from(config('mail.from.address'), config('mail.from.name'));
        });
        
        echo "Log email sent successfully!\n";
        
        // Restore SMTP
        config(['mail.default' => 'smtp']);
        
        // Check the log
        $logFile = storage_path('logs/laravel.log');
        if (file_exists($logFile)) {
            $logs = file_get_contents($logFile);
            $recentLogs = substr($logs, -1000);
            echo "Recent log entries:\n";
            echo $recentLogs;
        }
        
    } catch (Exception $e) {
        echo "Alternative method failed: " . $e->getMessage() . "\n";
    }
    
    echo "\n=== Gmail Debug Complete ===\n";
    echo "If you're still not receiving emails, the issue might be:\n";
    echo "1. Gmail app password is incorrect or expired\n";
    echo "2. 2FA is not enabled on the Gmail account\n";
    echo "3. Gmail is blocking the emails (security settings)\n";
    echo "4. The from address doesn't match the Gmail username\n";
    echo "5. Gmail rate limiting\n";
    
    echo "\nTry these solutions:\n";
    echo "1. Generate a new Gmail app password\n";
    echo "2. Enable 2FA on the Gmail account\n";
    echo "3. Check Gmail security settings for less secure apps\n";
    echo "4. Try using a different Gmail account\n";
    
} catch (Exception $e) {
    echo "Debug failed: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}
