<?php

namespace Database\Seeders;

use App\Models\AgeLoadBracket;
use App\Models\PricingConfig;
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
        // Create the initial pricing configuration (version 1, active)
        $config = PricingConfig::updateOrCreate(
            ['version' => 1],
            [
                'fixed_rate' => 3.00,
                'is_active' => true,
                'activated_at' => now(),
            ]
        );

        // Seed age load brackets for version 1
        $brackets = [
            ['min_age' => 18, 'max_age' => 30, 'load_factor' => 0.600],
            ['min_age' => 31, 'max_age' => 40, 'load_factor' => 0.700],
            ['min_age' => 41, 'max_age' => 50, 'load_factor' => 0.800],
            ['min_age' => 51, 'max_age' => 60, 'load_factor' => 0.900],
            ['min_age' => 61, 'max_age' => 70, 'load_factor' => 1.000],
        ];

        foreach ($brackets as $bracket) {
            AgeLoadBracket::updateOrCreate(
                [
                    'pricing_config_id' => $config->id,
                    'min_age' => $bracket['min_age'],
                    'max_age' => $bracket['max_age'],
                ],
                $bracket
            );
        }

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
    }
}
