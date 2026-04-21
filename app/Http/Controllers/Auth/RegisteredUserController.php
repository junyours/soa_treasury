<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => [
                'required',
                'string',
                'min:2',
                'max:255',
                'regex:/^[a-zA-Z\s\-\.]+$/',
            ],
            'email' => [
                'required',
                'string',
                'lowercase',
                'email:rfc,dns',
                'max:255',
                function ($attribute, $value, $fail) {
                    $existingUser = User::where('email', $value)->first();
                    if ($existingUser && $existingUser->approval_status !== 'declined') {
                        $fail('The email has already been taken.');
                    }
                },
            ],
            'password' => [
                'required',
                'confirmed',
                'min:6',
            ],
        ], [
            'name.regex' => 'Name may only contain letters, spaces, hyphens, and periods.',
            'email.email' => 'Please enter a valid email address.',
            'email.dns' => 'Email domain does not exist or is not reachable.',
                    ]);

        // Check if user exists with declined status
        $existingUser = User::where('email', $request->email)->first();
        
        if ($existingUser && $existingUser->approval_status === 'declined') {
            // Update the declined user's information
            $existingUser->update([
                'name' => $request->name,
                'password' => Hash::make($request->password),
                'approval_status' => 'pending', // Reset to pending for new approval
                'decline_reason' => null, // Clear previous decline reason
                'email_verified_at' => null, // Require email verification again
            ]);
            $user = $existingUser;
        } else {
            // Create new user
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'approval_status' => 'pending', // Explicitly set to pending
            ]);
        }

        event(new Registered($user));

        // Don't auto-login user - they need to verify email first and wait for admin approval
        // Auth::login($user); // REMOVED - users should not be auto-logged in

        return redirect(route('verification.notice'));
    }
}
