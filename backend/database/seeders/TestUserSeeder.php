<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class TestUserSeeder extends Seeder
{
    public function run(): void
    {
        User::query()->firstOrCreate(
            ['email' => 'test@example.com'],
            User::factory()
                ->verified()
                ->raw([
                    'name' => 'Test User',
                    'email' => 'test@example.com',
                    'password' => 'password',
                ])
        );
    }
}
