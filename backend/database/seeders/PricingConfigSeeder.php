<?php

namespace Database\Seeders;

use App\Models\AgeLoadBracket;
use App\Models\PricingConfig;
use Illuminate\Database\Seeder;

class PricingConfigSeeder extends Seeder
{
    private const AGE_LOAD_BRACKETS = [
        ['min_age' => 18, 'max_age' => 30, 'load_factor' => 0.600],
        ['min_age' => 31, 'max_age' => 40, 'load_factor' => 0.700],
        ['min_age' => 41, 'max_age' => 50, 'load_factor' => 0.800],
        ['min_age' => 51, 'max_age' => 60, 'load_factor' => 0.900],
        ['min_age' => 61, 'max_age' => 70, 'load_factor' => 1.000],
    ];

    public function run(): void
    {
        $config = PricingConfig::query()->updateOrCreate(
            ['version' => 1],
            [
                'fixed_rate' => 3.00,
                'is_active' => true,
                'activated_at' => now(),
            ]
        );

        foreach (self::AGE_LOAD_BRACKETS as $bracket) {
            AgeLoadBracket::query()->updateOrCreate(
                [
                    'pricing_config_id' => $config->id,
                    'min_age' => $bracket['min_age'],
                    'max_age' => $bracket['max_age'],
                ],
                [
                    'load_factor' => $bracket['load_factor'],
                ]
            );
        }
    }
}
