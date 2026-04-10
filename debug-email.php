<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

try {
    echo "=== Email Configuration Debug ===\n";
    
    // Check mail configuration
    echo "Mail Driver: " . config('mail.default') . "\n";
    echo "Mail Host: " . config('mail.mailers.smtp.host') . "\n";
    echo "Mail Port: " . config('mail.mailers.smtp.port') . "\n";
    echo "Mail Encryption: " . config('mail.mailers.smtp.encryption') . "\n";
    echo "Mail Username: " . config('mail.mailers.smtp.username') . "\n";
    echo "Mail From Address: " . config('mail.from.address') . "\n";
    echo "Mail From Name: " . config('mail.from.name') . "\n";
    
    echo "\n=== Testing Email Delivery ===\n";
    
    // Test with detailed error reporting
    try {
        Mail::raw('This is a detailed test email from Treasury App at ' . date('Y-m-d H:i:s'), function($message) {
            $message->to('treasuryapp0@gmail.com')
                    ->subject('Treasury App - Detailed Email Test ' . date('Y-m-d H:i:s'))
                    ->from(config('mail.from.address'), config('mail.from.name'));
            
            echo "Email message prepared successfully\n";
        });
        
        echo "Email sent successfully via SMTP!\n";
        
    } catch (\Exception $e) {
        echo "Email sending failed: " . $e->getMessage() . "\n";
        echo "Error details: " . $e->getTraceAsString() . "\n";
        
        // Log the error
        Log::error('Email sending failed: ' . $e->getMessage());
    }
    
    // Check if queue is being used
    echo "\n=== Queue Configuration ===\n";
    echo "Queue Driver: " . config('queue.default') . "\n";
    
    // Test queue if needed
    if (config('queue.default') !== 'sync') {
        echo "Queue is being used - checking if emails are queued\n";
        
        try {
            Mail::to('treasuryapp0@gmail.com')->queue(
                new \Illuminate\Mail\Mailable(
                    'This is a queued test email',
                    'Queued Email Test'
                )
            );
            echo "Email queued successfully!\n";
        } catch (\Exception $e) {
            echo "Queue email failed: " . $e->getMessage() . "\n";
        }
    }
    
    echo "\n=== Recent Log Entries ===\n";
    $logFile = storage_path('logs/laravel.log');
    if (file_exists($logFile)) {
        $logs = file_get_contents($logFile);
        $recentLogs = substr($logs, -2000); // Last 2000 characters
        echo $recentLogs;
    } else {
        echo "No log file found\n";
    }
    
} catch (Exception $e) {
    echo "Debug script error: " . $e->getMessage() . "\n";
}
