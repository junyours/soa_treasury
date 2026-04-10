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
    echo "=== FrontPage Registration Debug ===\n";
    
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
    
    // Step 1: Check if EventServiceProvider is loaded
    echo "\n1. Checking EventServiceProvider...\n";
    
    $providers = app()->getProviders(\App\Providers\EventServiceProvider::class);
    if ($providers) {
        echo "EventServiceProvider is loaded\n";
    } else {
        echo "ERROR: EventServiceProvider is NOT loaded!\n";
    }
    
    // Step 2: Check registered events
    echo "\n2. Checking registered events...\n";
    
    $eventServiceProvider = app(\App\Providers\EventServiceProvider::class);
    if ($eventServiceProvider) {
        $listen = $eventServiceProvider->listen;
        echo "Registered events:\n";
        foreach ($listen as $event => $listeners) {
            echo "- $event: " . implode(', ', $listeners) . "\n";
        }
    } else {
        echo "ERROR: EventServiceProvider not found!\n";
    }
    
    // Step 3: Test manual registration
    echo "\n3. Testing manual registration...\n";
    
    $testEmail = 'frontpage-debug-' . time() . '@gmail.com';
    
    // Set up event listener
    Event::listen(Registered::class, function ($event) {
        echo "Registered event fired for: " . $event->user->email . "\n";
        
        try {
            $event->user->sendEmailVerificationNotification();
            echo "Verification email sent!\n";
        } catch (Exception $e) {
            echo "Failed to send verification: " . $e->getMessage() . "\n";
        }
    });
    
    // Create user manually
    $user = User::create([
        'name' => 'FrontPage Debug User',
        'email' => $testEmail,
        'password' => bcrypt('TestPass123!'),
    ]);
    
    echo "User created: $testEmail\n";
    
    // Fire event manually
    event(new Registered($user));
    
    // Step 4: Test the actual controller
    echo "\n4. Testing registration controller...\n";
    
    $controller = new RegisteredUserController();
    
    // Create request with FormData simulation
    $requestData = [
        'name' => 'Controller Test User',
        'email' => 'controller-test-' . time() . '@gmail.com',
        'password' => 'TestPass123!',
        'password_confirmation' => 'TestPass123!',
    ];
    
    $request = Request::create('/register', 'POST', $requestData);
    
    try {
        $response = $controller->store($request);
        echo "Controller response: " . $response->getStatusCode() . "\n";
        echo "Redirect to: " . $response->getTargetUrl() . "\n";
    } catch (Exception $e) {
        echo "Controller error: " . $e->getMessage() . "\n";
    }
    
    // Step 5: Test email sending directly
    echo "\n5. Testing direct email sending...\n";
    
    try {
        Mail::raw('Direct test email at ' . date('H:i:s'), function($message) use ($testEmail) {
            $message->to($testEmail)
                    ->subject('Direct Test - ' . date('H:i:s'))
                    ->from('treasuryapp0@gmail.com', 'Treasury Office');
        });
        echo "Direct email sent to: $testEmail\n";
    } catch (Exception $e) {
        echo "Direct email failed: " . $e->getMessage() . "\n";
    }
    
    // Cleanup
    $user->delete();
    
    echo "\n=== Debug Complete ===\n";
    echo "Check the above output to see where the issue is.\n";
    echo "If EventServiceProvider is loaded and events fire, the issue might be in the frontend form submission.\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . ":" . $e->getLine() . "\n";
}
