<?php

// Load environment first
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

// Bootstrap Laravel
require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Mail;

try {
    echo "=== Simple Gmail Test ===\n";
    
    // Check if env is loaded
    echo "Environment check:\n";
    echo "MAIL_USERNAME: " . env('MAIL_USERNAME') . "\n";
    echo "MAIL_PASSWORD: " . (env('MAIL_PASSWORD') ? 'SET' : 'NOT SET') . "\n";
    echo "MAIL_HOST: " . env('MAIL_HOST') . "\n";
    
    // Test sending email
    echo "\nSending test email...\n";
    
    Mail::raw('This is a test email from Treasury App at ' . date('Y-m-d H:i:s'), function($message) {
        $message->to('treasuryapp0@gmail.com')
                ->subject('Treasury App Test - ' . date('H:i:s'))
                ->from(env('MAIL_FROM_ADDRESS'), 'Treasury Office');
    });
    
    echo "Email sent successfully!\n";
    
    // Test to second address
    Mail::raw('This is a test email to jpacamalan404@gmail.com at ' . date('Y-m-d H:i:s'), function($message) {
        $message->to('jpacamalan404@gmail.com')
                ->subject('Treasury App Test (JP) - ' . date('H:i:s'))
                ->from(env('MAIL_FROM_ADDRESS'), 'Treasury Office');
    });
    
    echo "Email sent to jpacamalan404@gmail.com successfully!\n";
    
    echo "\nCheck both Gmail inboxes for emails with subject 'Treasury App Test'\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . ":" . $e->getLine() . "\n";
}
