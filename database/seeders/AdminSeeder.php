<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create or update the admin account
        User::updateOrCreate(
            ['email' => 'admin@mto.local'],
            [
                'name' => 'System Administrator',
                'email' => 'admin@mto.local',
                'password' => Hash::make('mtostaff2026'),
                'email_verified_at' => now(),
                'approval_status' => 'approved',
                'role' => 'admin',
            ]
        );
    }
}
