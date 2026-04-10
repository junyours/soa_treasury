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
    echo "=== Middleware Debug ===\n";
    
    // Step 1: Check what middleware is registered
    echo "\n1. Checking registered middleware...\n";
    
    $middlewareAliases = app('router')->getMiddleware();
    echo "Registered middleware aliases:\n";
    foreach ($middlewareAliases as $alias => $class) {
        echo "- $alias: $class\n";
    }
    
    // Check if 'verified' is registered
    if (isset($middlewareAliases['verified'])) {
        echo "\n'verified' middleware found: " . $middlewareAliases['verified'] . "\n";
    } else {
        echo "\n'verified' middleware NOT found!\n";
    }
    
    // Step 2: Create an unverified user
    echo "\n2. Creating unverified user...\n";
    
    $testEmail = 'middleware-test-' . time() . '@gmail.com';
    $requestData = [
        'name' => 'Middleware Test User',
        'email' => $testEmail,
        'password' => 'TestPass123!',
        'password_confirmation' => 'TestPass123!',
    ];
    
    $request = Request::create('/register', 'POST', $requestData);
    $controller = new RegisteredUserController();
    $response = $controller->store($request);
    
    echo "User created: $testEmail\n";
    
    $user = User::where('email', $testEmail)->first();
    if ($user) {
        echo "User ID: " . $user->id . "\n";
        echo "Email verified: " . ($user->hasVerifiedEmail() ? 'Yes' : 'No') . "\n";
        
        // Step 3: Test the middleware directly
        echo "\n3. Testing middleware directly...\n";
        
        // Get the verified middleware
        $verifiedMiddleware = new \Illuminate\Auth\Middleware\EnsureEmailIsVerified();
        
        // Create a request
        $testRequest = Request::create('/statement-of-account');
        $testRequest->setUserResolver(function() use ($user) {
            return $user;
        });
        
        // Test the middleware
        try {
            $response = $verifiedMiddleware->handle($testRequest, function($request) {
                return response('Access granted', 200);
            });
            
            echo "Middleware response status: " . $response->getStatusCode() . "\n";
            
            if ($response->getStatusCode() === 302) {
                echo "Middleware correctly redirected to: " . $response->getTargetUrl() . "\n";
            } else {
                echo "WARNING: Middleware allowed access!\n";
            }
        } catch (Exception $e) {
            echo "Middleware test error: " . $e->getMessage() . "\n";
        }
        
        // Step 4: Test the actual route
        echo "\n4. Testing actual route...\n";
        
        // Authenticate the user
        auth()->login($user);
        
        try {
            $routeRequest = Request::create('/statement-of-account');
            $routeResponse = app()->handle($routeRequest);
            
            echo "Route response status: " . $routeResponse->getStatusCode() . "\n";
            
            if ($routeResponse->getStatusCode() === 302) {
                echo "Route redirected to: " . $routeResponse->getTargetUrl() . "\n";
                echo "Route middleware working correctly!\n";
            } else {
                echo "WARNING: Route allowed access!\n";
                echo "Response content: " . $routeResponse->getContent() . "\n";
            }
        } catch (Exception $e) {
            echo "Route test error: " . $e->getMessage() . "\n";
        }
        
        // Step 5: Check route definitions
        echo "\n5. Checking route definitions...\n";
        
        $routes = app('router')->getRoutes();
        foreach ($routes as $route) {
            if ($route->uri() === 'statement-of-account') {
                echo "Statement of account route found:\n";
                echo "- URI: " . $route->uri() . "\n";
                echo "- Methods: " . implode(', ', $route->methods()) . "\n";
                echo "- Middleware: " . implode(', ', $route->middleware()) . "\n";
                break;
            }
        }
        
        // Cleanup
        auth()->logout();
        $user->delete();
        echo "\nTest user deleted.\n";
    } else {
        echo "ERROR: User not found!\n";
    }
    
    echo "\n=== Debug Complete ===\n";
    
} catch (Exception $e) {
    echo "Debug error: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}
