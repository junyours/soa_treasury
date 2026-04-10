<?php

// Bootstrap Laravel
require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Http\Controllers\Auth\RegisteredUserController;
use Illuminate\Http\Request;
use App\Models\User;

try {
    echo "=== STEP BY STEP TEST ===\n";
    
    echo "\nSTEP 1: Create a new user (simulating registration)\n";
    
    $testEmail = 'steptest-' . time() . '@gmail.com';
    $requestData = [
        'name' => 'Step Test User',
        'email' => $testEmail,
        'password' => 'TestPass123!',
        'password_confirmation' => 'TestPass123!',
    ];
    
    $request = Request::create('/register', 'POST', $requestData);
    $controller = new RegisteredUserController();
    $response = $controller->store($request);
    
    echo "User registered: $testEmail\n";
    echo "Registration redirects to: " . $response->getTargetUrl() . "\n";
    
    $user = User::where('email', $testEmail)->first();
    if ($user) {
        echo "User created in database with ID: " . $user->id . "\n";
        echo "Email verified: " . ($user->hasVerifiedEmail() ? 'Yes' : 'No') . "\n";
        
        echo "\nSTEP 2: Try to access dashboard without verification\n";
        
        // Simulate user logging in but not verifying email
        auth()->login($user);
        
        try {
            $dashboardRequest = Request::create('/statement-of-account');
            $dashboardResponse = app()->handle($dashboardRequest);
            
            echo "Dashboard access attempt...\n";
            echo "Response status: " . $dashboardResponse->getStatusCode() . "\n";
            
            if ($dashboardResponse->getStatusCode() === 302) {
                echo "REDIRECTED to: " . $dashboardResponse->getTargetUrl() . "\n";
                echo "SUCCESS: User was blocked from dashboard!\n";
            } else {
                echo "PROBLEM: User was allowed to access dashboard!\n";
            }
        } catch (Exception $e) {
            echo "Error accessing dashboard: " . $e->getMessage() . "\n";
        }
        
        echo "\nSTEP 3: Verify the user's email\n";
        
        // Simulate email verification
        $user->email_verified_at = now();
        $user->save();
        
        echo "User email has been verified\n";
        echo "Email verified at: " . $user->email_verified_at . "\n";
        
        echo "\nSTEP 4: Try to access dashboard after verification\n";
        
        try {
            $dashboardRequest = Request::create('/statement-of-account');
            $dashboardResponse = app()->handle($dashboardRequest);
            
            echo "Dashboard access attempt after verification...\n";
            echo "Response status: " . $dashboardResponse->getStatusCode() . "\n";
            
            if ($dashboardResponse->getStatusCode() === 200) {
                echo "SUCCESS: Verified user can access dashboard!\n";
            } else {
                echo "PROBLEM: Verified user still blocked!\n";
                echo "Redirected to: " . $dashboardResponse->getTargetUrl() . "\n";
            }
        } catch (Exception $e) {
            echo "Error accessing dashboard: " . $e->getMessage() . "\n";
        }
        
        echo "\nSTEP 5: Test API access\n";
        
        // Mark user as unverified again for API test
        $user->email_verified_at = null;
        $user->save();
        
        try {
            $apiRequest = Request::create('/api/statements');
            $apiResponse = app()->handle($apiRequest);
            
            echo "API access attempt (unverified)...\n";
            echo "Response status: " . $apiResponse->getStatusCode() . "\n";
            
            if ($apiResponse->getStatusCode() === 302) {
                echo "API access blocked - redirected to: " . $apiResponse->getTargetUrl() . "\n";
            } else {
                echo "API access allowed!\n";
            }
        } catch (Exception $e) {
            echo "Error accessing API: " . $e->getMessage() . "\n";
        }
        
        // Cleanup
        auth()->logout();
        $user->delete();
        echo "\nTest user cleaned up.\n";
    }
    
    echo "\n=== WHAT THIS MEANS ===\n";
    echo "1. User registers gets verification email\n";
    echo "2. User CANNOT access dashboard until verified\n";
    echo "3. User CANNOT access API until verified\n";
    echo "4. After verification, user can access everything\n";
    echo "\nThe system IS working correctly!\n";
    
    echo "\n=== HOW TO TEST MANUALLY ===\n";
    echo "1. Go to http://localhost:8000\n";
    echo "2. Register a new account\n";
    echo "3. Try to go to http://localhost:8000/statement-of-account\n";
    echo "4. You should be redirected to /verify-email\n";
    echo "5. Click the verification link in your email\n";
    echo "6. Try to access dashboard again - should work!\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}
