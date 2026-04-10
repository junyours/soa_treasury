<?php

// Bootstrap Laravel
require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Config;

try {
    echo "=== Force Gmail Test ===\n";
    
    // Force the configuration
    Config::set('mail.default', 'smtp');
    Config::set('mail.mailers.smtp.transport', 'smtp');
    Config::set('mail.mailers.smtp.host', 'smtp.gmail.com');
    Config::set('mail.mailers.smtp.port', 587);
    Config::set('mail.mailers.smtp.encryption', 'tls');
    Config::set('mail.mailers.smtp.username', 'treasuryapp0@gmail.com');
    Config::set('mail.mailers.smtp.password', 'bdeuraqtogavrvrw');
    Config::set('mail.from.address', 'treasuryapp0@gmail.com');
    Config::set('mail.from.name', 'Treasury Office');
    
    echo "Configuration forced:\n";
    echo "Host: " . Config::get('mail.mailers.smtp.host') . "\n";
    echo "Port: " . Config::get('mail.mailers.smtp.port') . "\n";
    echo "Username: " . Config::get('mail.mailers.smtp.username') . "\n";
    echo "From: " . Config::get('mail.from.address') . "\n";
    
    // Test sending
    echo "\nSending email...\n";
    
    Mail::raw('Test email at ' . date('H:i:s'), function($message) {
        $message->to('treasuryapp0@gmail.com')
                ->subject('FORCE TEST - ' . date('H:i:s'))
                ->from('treasuryapp0@gmail.com', 'Treasury Office');
    });
    
    echo "Email sent to treasuryapp0@gmail.com!\n";
    
    Mail::raw('Test email to JP at ' . date('H:i:s'), function($message) {
        $message->to('jpacamalan404@gmail.com')
                ->subject('FORCE TEST JP - ' . date('H:i:s'))
                ->from('treasuryapp0@gmail.com', 'Treasury Office');
    });
    
    echo "Email sent to jpacamalan404@gmail.com!\n";
    
    echo "\nCHECK YOUR GMAIL NOW!\n";
    echo "Subject: 'FORCE TEST - [time]'\n";
    echo "Subject: 'FORCE TEST JP - [time]'\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . ":" . $e->getLine() . "\n";
    
    // Show more details
    echo "\nDebug info:\n";
    echo "Current config: " . print_r(Config::get('mail'), true) . "\n";
}
