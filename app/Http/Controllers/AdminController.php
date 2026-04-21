<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AdminController extends Controller
{
    public function __construct()
    {
        // Middleware will be applied via routes
    }

    /**
     * Display the admin dashboard with pending users.
     */
    public function dashboard(): Response
    {
        // Check if user is authenticated and is admin
        if (!Auth::check() || Auth::user()->role !== 'admin') {
            abort(403, 'Unauthorized access.');
        }

        $pendingUsers = User::where('approval_status', 'pending')
            ->where('role', '!=', 'admin')
            ->orderBy('created_at', 'desc')
            ->get();

        $approvedUsers = User::where('approval_status', 'approved')
            ->where('role', '!=', 'admin')
            ->orderBy('updated_at', 'desc')
            ->limit(10)
            ->get();

        $declinedUsers = User::where('approval_status', 'declined')
            ->where('role', '!=', 'admin')
            ->orderBy('updated_at', 'desc')
            ->limit(10)
            ->get();

        return Inertia::render('Admin/Dashboard', [
            'pendingUsers' => $pendingUsers,
            'approvedUsers' => $approvedUsers,
            'declinedUsers' => $declinedUsers,
            'pendingCount' => $pendingUsers->count(),
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
        ]);
    }

    /**
     * Approve a user.
     */
    public function approveUser(Request $request, User $user)
    {
        // Check if user is authenticated and is admin
        if (!Auth::check() || Auth::user()->role !== 'admin') {
            abort(403, 'Unauthorized access.');
        }

        $user->update([
            'approval_status' => 'approved',
            'decline_reason' => null,
        ]);

        return redirect()->route('admin.dashboard')->with('success', 'User has been approved successfully.');
    }

    /**
     * Decline a user.
     */
    public function declineUser(Request $request, User $user)
    {
        // Check if user is authenticated and is admin
        if (!Auth::check() || Auth::user()->role !== 'admin') {
            abort(403, 'Unauthorized access.');
        }

        // Debug: Log the incoming request data
        \Log::info('Decline request data:', ['data' => $request->all()]);
        \Log::info('Request method:', ['method' => $request->method()]);
        \Log::info('Request headers:', ['headers' => $request->headers->all()]);
        \Log::info('User being declined:', ['id' => $user->id, 'name' => $user->name]);
        
        // Direct debugging - check what we actually have
        $reason = $request->input('reason');
        \Log::info('Raw reason value:', ['reason' => $reason]);
        \Log::info('Reason exists:', ['exists' => isset($reason)]);
        \Log::info('Reason is empty:', ['empty' => empty($reason)]);
        \Log::info('Reason is null:', ['null' => is_null($reason)]);

        try {
            $validated = $request->validate([
                'reason' => 'required|string|max:255',
            ]);

            $user->update([
                'approval_status' => 'declined',
                'decline_reason' => $validated['reason'],
            ]);

            \Log::info('User declined successfully', ['user_id' => $user->id]);

            return redirect()->route('admin.dashboard')->with('success', 'User has been declined.');
        } catch (\Exception $e) {
            \Log::error('Error declining user: ' . $e->getMessage());
            return redirect()->route('admin.dashboard')->with('error', 'Error declining user: ' . $e->getMessage());
        }
    }

    /**
     * Get pending users count for API.
     */
    public function getPendingCount()
    {
        // Check if user is authenticated and is admin
        if (!Auth::check() || Auth::user()->role !== 'admin') {
            return response()->json(['count' => 0], 403);
        }

        $count = User::where('approval_status', 'pending')
            ->where('role', '!=', 'admin')
            ->count();

        return response()->json(['count' => $count]);
    }
}
