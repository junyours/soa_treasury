<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Auth\EmailVerificationRequest as BaseEmailVerificationRequest;

class UnauthenticatedEmailVerificationRequest extends BaseEmailVerificationRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Always authorize - we'll verify the signature and find the user manually
        return true;
    }

    /**
     * Get the user for the request.
     * This override allows us to find the user even when not authenticated.
     */
    public function user($guard = null)
    {
        // If user is authenticated, return them
        if ($user = parent::user($guard)) {
            return $user;
        }

        // Otherwise, find the user by the route parameters
        $userId = $this->route('id');
        $hash = $this->route('hash');

        \Log::info('Custom request - ID: ' . $userId . ', Hash: ' . $hash);

        if (!$userId || !$hash) {
            \Log::info('Missing route parameters');
            return null;
        }

        $user = \App\Models\User::find($userId);
        \Log::info('Found user: ' . ($user ? $user->email : 'null'));

        // Verify the hash matches the email
        if ($user && hash_equals(sha1($user->getEmailForVerification()), $hash)) {
            \Log::info('Hash matches, returning user');
            return $user;
        }

        \Log::info('Hash does not match');
        return null;
    }
}
