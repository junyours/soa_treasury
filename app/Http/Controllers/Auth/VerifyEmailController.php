<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\UnauthenticatedEmailVerificationRequest;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\RedirectResponse;

class VerifyEmailController extends Controller
{
    /**
     * Mark the authenticated user's email address as verified.
     */
    public function __invoke(UnauthenticatedEmailVerificationRequest $request): RedirectResponse
    {
        // Get the user from the custom request (handles both authenticated and unauthenticated)
        $user = $request->user();
        
        \Log::info('VerifyEmailController called for user: ' . ($user ? $user->email : 'null'));
        
        if (!$user) {
            \Log::error('Invalid verification link - user not found');
            return redirect(route('front'))->with('error', 'Invalid verification link');
        }
        
        if ($user->hasVerifiedEmail()) {
            \Log::info('User already verified, redirecting to front page');
            return redirect(route('front') . '?email_verified=true');
        }

        if ($user->markEmailAsVerified()) {
            \Log::info('User email marked as verified: ' . $user->email);
            event(new Verified($user));
        }

        $redirectUrl = route('front') . '?email_verified=true';
        \Log::info('Redirecting to: ' . $redirectUrl);
        
        return redirect($redirectUrl);
    }
}
