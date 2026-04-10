<?php

// Bootstrap Laravel
require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Event;
use Illuminate\Auth\Events\Registered;
use App\Http\Controllers\Auth\RegisteredUserController;
use Illuminate\Http\Request;
use App\Models\User;

try {
    echo "=== Final Verification Test ===\n";
    
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
    
    // Test 1: Send verification email to a test user
    echo "\n1. Creating test user and sending verification...\n";
    
    $testEmail = 'final-test-' . time() . '@gmail.com';
    $requestData = [
        'name' => 'Final Test User',
        'email' => $testEmail,
        'password' => 'TestPass123!',
        'password_confirmation' => 'TestPass123!',
    ];
    
    // Set up event listener
    Event::listen(Registered::class, function ($event) {
        echo "Registered event fired for: " . $event->user->email . "\n";
        
        try {
            $event->user->sendEmailVerificationNotification();
            echo "Verification email sent to: " . $event->user->email . "\n";
        } catch (Exception $e) {
            echo "Failed to send verification: " . $e->getMessage() . "\n";
        }
    });
    
    // Create user
    $request = Request::create('/register', 'POST', $requestData);
    $controller = new RegisteredUserController();
    $response = $controller->store($request);
    
    echo "User created: $testEmail\n";
    echo "Redirect to: " . $response->getTargetUrl() . "\n";
    
    // Test 2: Send verification email manually to both your addresses
    echo "\n2. Sending verification emails to your addresses...\n";
    
    try {
        Mail::raw('Please verify your email address for Treasury App.

Click here: http://localhost/verify-email

If you did not create an account, you can ignore this email.

Treasury Office', function($message) {
            $message->to('treasuryapp0@gmail.com')
                    ->subject('Please Verify Your Email - Treasury App')
                    ->from('treasuryapp0@gmail.com', 'Treasury Office');
        });
        echo "Verification email sent to treasuryapp0@gmail.com\n";
    } catch (Exception $e) {
        echo "Failed to send to treasuryapp0@gmail.com: " . $e->getMessage() . "\n";
    }
    
    try {
        Mail::raw('Please verify your email address for Treasury App.

Click here: http://localhost/verify-email

If you did not create an account, you can ignore this email.

Treasury Office', function($message) {
            $message->to('jpacamalan404@gmail.com')
                    ->subject('Please Verify Your Email - Treasury App')
                    ->from('treasuryapp0@gmail.com', 'Treasury Office');
        });
        echo "Verification email sent to jpacamalan404@gmail.com\n";
    } catch (Exception $e) {
        echo "Failed to send to jpacamalan404@gmail.com: " . $e->getMessage() . "\n";
    }
    
    // Test 3: Check the user
    $user = User::where('email', $testEmail)->first();
    if ($user) {
        echo "\n3. User details:\n";
        echo "ID: " . $user->id . "\n";
        echo "Email: " . $user->email . "\n";
        echo "Verified: " . ($user->hasVerifiedEmail() ? 'Yes' : 'No') . "\n";
        
        // Cleanup
        $user->delete();
        echo "Test user deleted\n";
    }
    
    echo "\n=== CHECK YOUR GMAIL NOW ===\n";
    echo "You should have received emails with subject:\n";
    echo "- 'Please Verify Your Email - Treasury App'\n";
    echo "- 'FORCE TEST - [time]' (from previous test)\n";
    echo "\nCheck BOTH Gmail accounts:\n";
    echo "- treasuryapp0@gmail.com\n";
    echo "- jpacamalan404@gmail.com\n";
    
    echo "\nIf you can see these emails, the system is working!\n";
    echo "Users will receive verification emails when they register.\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . ":" . $e->getLine() . "\n";
}
