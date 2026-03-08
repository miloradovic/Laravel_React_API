<?php

namespace Database\Seeders;

use App\Models\PricingSetting;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        PricingSetting::updateOrCreate(
            ['id' => 1],
            [
                'fixed_rate' => 3,
                'age_loads' => [
                    [18, 30, 0.6],
                    [31, 40, 0.7],
                    [41, 50, 0.8],
                    [51, 60, 0.9],
                    [61, 70, 1.0],
                ],
            ]
        );

        // Create a test user for the travel insurance API
        User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'email' => 'test@example.com',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );

        $this->command->info('Test user created: test@example.com / password');
        $this->command->info('Default pricing settings created/updated');
    }
}
