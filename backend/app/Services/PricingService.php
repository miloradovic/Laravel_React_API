<?php

namespace App\Services;

use App\Models\PricingConfig;
use Carbon\Carbon;

class PricingService
{
    /**
     * Calculate quotation based on ages, dates and currency
     */
    public function calculateQuotation(array $ages, string $startDate, string $endDate, string $currencyId): array
    {
        $config = PricingConfig::getActive();
        $tripLength = $this->calculateTripLength($startDate, $endDate);

        $total = 0;
        $breakdown = [];

        foreach ($ages as $age) {
            $bracket = $this->findBracket($config, $age);
            $subtotal = $config->fixed_rate * $bracket->load_factor * $tripLength;
            $total += $subtotal;

            $breakdown[] = [
                'age' => (int) $age,
                'age_load' => $bracket->load_factor,
                'subtotal' => round($subtotal, 2),
            ];
        }

        return [
            'total' => round($total, 2),
            'currency_id' => $currencyId,
            'trip_length' => $tripLength,
            'breakdown' => $breakdown,
            'start_date' => $startDate,
            'end_date' => $endDate,
        ];
    }

    /**
     * Calculate trip length in days (inclusive)
     */
    private function calculateTripLength(string $startDate, string $endDate): int
    {
        $start = Carbon::createFromFormat('Y-m-d', $startDate);
        $end = Carbon::createFromFormat('Y-m-d', $endDate);

        return $start->diffInDays($end) + 1;
    }

    /**
     * Find the matching bracket for a given age from the active config.
     *
     * @throws \InvalidArgumentException
     */
    private function findBracket(PricingConfig $config, int $age): \App\Models\AgeLoadBracket
    {
        foreach ($config->brackets as $bracket) {
            if ($age >= $bracket->min_age && $age <= $bracket->max_age) {
                return $bracket;
            }
        }

        throw new \InvalidArgumentException("Age {$age} is not within any configured age bracket");
    }

    /**
     * Validate if age is within any active bracket range
     */
    public function isValidAge(int $age): bool
    {
        $config = PricingConfig::getActive();

        foreach ($config->brackets as $bracket) {
            if ($age >= $bracket->min_age && $age <= $bracket->max_age) {
                return true;
            }
        }

        return false;
    }

    /**
     * Get all age load brackets for reference
     */
    public function getAgeLoadTable(): array
    {
        $config = PricingConfig::getActive();

        return $config->brackets->map(fn ($b) => [
            'min_age' => $b->min_age,
            'max_age' => $b->max_age,
            'load_factor' => $b->load_factor,
        ])->all();
    }

    /**
     * Get the active fixed rate
     */
    public function getFixedRate(): float
    {
        return PricingConfig::getActive()->fixed_rate;
    }

    /**
     * Get supported currencies
     */
    public function getSupportedCurrencies(): array
    {
        return [
            ['code' => 'EUR', 'name' => 'Euro', 'symbol' => '€'],
            ['code' => 'GBP', 'name' => 'British Pound', 'symbol' => '£'],
            ['code' => 'USD', 'name' => 'US Dollar', 'symbol' => '$'],
        ];
    }
}
