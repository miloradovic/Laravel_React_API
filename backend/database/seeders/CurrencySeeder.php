<?php

namespace Database\Seeders;

use App\Models\Currency;
use Illuminate\Database\Seeder;

class CurrencySeeder extends Seeder
{
    public function run(): void
    {
        Currency::query()->upsert(
            [
                ['code' => 'EUR', 'name' => 'Euro', 'symbol' => '€', 'is_active' => true],
                ['code' => 'GBP', 'name' => 'British Pound', 'symbol' => '£', 'is_active' => true],
                ['code' => 'USD', 'name' => 'US Dollar', 'symbol' => '$', 'is_active' => true],
            ],
            ['code'],
            ['name', 'symbol', 'is_active']
        );
    }
}
