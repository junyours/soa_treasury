<?php

// Bootstrap Laravel
require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Event;
use Illuminate\Auth\Events\Registered;
use App\Http\Controllers\Auth\RegisteredUserController;
use Illuminate\Http\Request;
use App\Models\User;

try {
    echo "=== Final Registration Test ===\n";
    
    // Check configuration
    echo "Configuration:\n";
    echo "Mail driver: " . config('mail.default') . "\n";
    echo "Queue driver: " . config('queue.default') . "\n";
    echo "SMTP host: " . config('mail.mailers.smtp.host') . "\n";
    echo "SMTP port: " . config('mail.mailers.smtp.port') . "\n";
    echo "SMTP encryption: " . config('mail.mailers.smtp.encryption') . "\n";
    echo "From address: " . config('mail.from.address') . "\n";
    
    // Set up event tracking
    $eventFired = false;
    $emailSent = false;
    
    Event::listen(Registered::class, function ($event) use (&$eventFired, &$emailSent) {
        $eventFired = true;
        echo "Registered event fired for: " . $event->user->email . "\n";
        echo "User ID: " . $event->user->id . "\n";
        echo "User verified: " . ($event->user->hasVerifiedEmail() ? 'Yes' : 'No') . "\n";
        
        // Check if the automatic listener sends the email
        try {
            $event->user->sendEmailVerificationNotification();
            $emailSent = true;
            echo "Email verification notification sent!\n";
        } catch (Exception $e) {
            echo "Email notification failed: " . $e->getMessage() . "\n";
        }
    });
    
    // Create registration request
    $testEmail = 'final-test-' . time() . '@gmail.com';
    $requestData = [
        'name' => 'Final Test User',
        'email' => $testEmail,
        'password' => 'TestPass123!',
        'password_confirmation' => 'TestPass123!',
    ];
    
    echo "\nRegistration data:\n";
    echo "Name: " . $requestData['name'] . "\n";
    echo "Email: " . $requestData['email'] . "\n";
    echo "Password: [hidden]\n";
    
    // Create request
    $request = Request::create('/register', 'POST', $requestData);
    
    echo "\nProcessing registration...\n";
    
    // Call registration controller
    $controller = new RegisteredUserController();
    $response = $controller->store($request);
    
    echo "Registration completed!\n";
    echo "Response status: " . $response->getStatusCode() . "\n";
    echo "Redirect URL: " . $response->getTargetUrl() . "\n";
    
    // Check user in database
    $user = User::where('email', $testEmail)->first();
    if ($user) {
        echo "\nUser found in database:\n";
        echo "User ID: " . $user->id . "\n";
        echo "Name: " . $user->name . "\n";
        echo "Email: " . $user->email . "\n";
        echo "Email verified at: " . ($user->email_verified_at ?: 'NULL') . "\n";
        echo "Has verified email: " . ($user->hasVerifiedEmail() ? 'Yes' : 'No') . "\n";
        
        // Test sending a verification email manually
        echo "\nTesting manual email send...\n";
        try {
            $user->sendEmailVerificationNotification();
            echo "Manual email send successful!\n";
        } catch (Exception $e) {
            echo "Manual email send failed: " . $e->getMessage() . "\n";
        }
        
        // Clean up
        $user->delete();
        echo "\nTest user deleted.\n";
    } else {
        echo "\nERROR: User not found in database!\n";
    }
    
    // Summary
    echo "\n=== Test Summary ===\n";
    echo "Event fired: " . ($eventFired ? 'Yes' : 'No') . "\n";
    echo "Email sent: " . ($emailSent ? 'Yes' : 'No') . "\n";
    echo "User created: " . ($user ? 'Yes' : 'No') . "\n";
    echo "Redirect to verification: " . (strpos($response->getTargetUrl(), 'verify-email') !== false ? 'Yes' : 'No') . "\n";
    
    if ($eventFired && $emailSent && $user) {
        echo "\nSUCCESS: Email verification system is working!\n";
        echo "Check your Gmail inbox for verification emails.\n";
    } else {
        echo "\nISSUE: Some components are not working properly.\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . ":" . $e->getLine() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}
