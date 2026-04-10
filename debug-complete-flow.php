<?php

// Load environment variables first
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Event;
use Illuminate\Auth\Events\Registered;
use App\Models\User;

try {
    echo "=== Complete Email Debug ===\n";
    
    // 1. Check current configuration
    echo "\n1. Current Configuration:\n";
    echo "MAIL_MAILER: " . env('MAIL_MAILER') . "\n";
    echo "MAIL_HOST: " . env('MAIL_HOST') . "\n";
    echo "MAIL_PORT: " . env('MAIL_PORT') . "\n";
    echo "MAIL_ENCRYPTION: " . env('MAIL_ENCRYPTION') . "\n";
    echo "MAIL_USERNAME: " . env('MAIL_USERNAME') . "\n";
    echo "MAIL_FROM_ADDRESS: " . env('MAIL_FROM_ADDRESS') . "\n";
    echo "QUEUE_CONNECTION: " . env('QUEUE_CONNECTION') . "\n";
    
    // 2. Test basic email sending
    echo "\n2. Testing basic email sending...\n";
    try {
        Mail::raw('Test email at ' . date('Y-m-d H:i:s'), function($message) {
            $message->to('treasuryapp0@gmail.com')
                    ->subject('Basic Test Email ' . date('H:i:s'))
                    ->from(env('MAIL_FROM_ADDRESS'), 'Treasury App');
        });
        echo "Basic email sent successfully\n";
    } catch (Exception $e) {
        echo "Basic email failed: " . $e->getMessage() . "\n";
    }
    
    // 3. Test with actual Laravel notification system
    echo "\n3. Testing Laravel notification system...\n";
    
    // Create a test user
    $testEmail = 'notification-test-' . time() . '@gmail.com';
    $user = User::create([
        'name' => 'Notification Test',
        'email' => $testEmail,
        'password' => bcrypt('password123'),
    ]);
    
    echo "Created test user: $testEmail\n";
    
    // Listen for events
    Event::listen(Registered::class, function ($event) {
        echo "Registered event fired for: " . $event->user->email . "\n";
        echo "User verified: " . ($event->user->hasVerifiedEmail() ? 'Yes' : 'No') . "\n";
        
        try {
            $event->user->sendEmailVerificationNotification();
            echo "Email verification notification sent\n";
        } catch (Exception $e) {
            echo "Failed to send notification: " . $e->getMessage() . "\n";
        }
    });
    
    // Fire the event
    event(new Registered($user));
    
    // 4. Check logs
    echo "\n4. Checking recent logs...\n";
    $logFile = storage_path('logs/laravel.log');
    if (file_exists($logFile)) {
        $logs = file_get_contents($logFile);
        $recentLogs = substr($logs, -3000); // Last 3000 characters
        echo "Recent log entries:\n";
        echo $recentLogs;
    } else {
        echo "No log file found\n";
    }
    
    // 5. Test mail configuration in detail
    echo "\n5. Detailed mail configuration:\n";
    $config = config('mail');
    echo "Mail driver: " . $config['default'] . "\n";
    echo "SMTP host: " . $config['mailers']['smtp']['host'] . "\n";
    echo "SMTP port: " . $config['mailers']['smtp']['port'] . "\n";
    echo "SMTP encryption: " . ($config['mailers']['smtp']['encryption'] ?? 'none') . "\n";
    echo "SMTP username: " . $config['mailers']['smtp']['username'] . "\n";
    echo "From address: " . $config['from']['address'] . "\n";
    echo "From name: " . $config['from']['name'] . "\n";
    
    // 6. Test with different email service
    echo "\n6. Testing with mail log driver...\n";
    
    // Temporarily switch to log driver
    config(['mail.default' => 'log']);
    
    try {
        Mail::raw('This should go to log file', function($message) {
            $message->to('test@example.com')
                    ->subject('Log Test Email')
                    ->from('test@example.com', 'Test');
        });
        echo "Log email sent successfully\n";
    } catch (Exception $e) {
        echo "Log email failed: " . $e->getMessage() . "\n";
    }
    
    // Restore SMTP
    config(['mail.default' => 'smtp']);
    
    // Cleanup
    $user->delete();
    echo "\nTest user deleted\n";
    
    echo "\n=== Debug complete ===\n";
    
} catch (Exception $e) {
    echo "Debug error: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}
