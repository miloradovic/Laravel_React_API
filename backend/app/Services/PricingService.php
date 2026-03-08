<?php

namespace App\Services;

use App\Models\PricingSetting;
use Carbon\Carbon;
use Throwable;

class PricingService
{
    /**
     * Default values used when config is missing or invalid.
     */
    private const DEFAULT_FIXED_RATE = 3.0;
    private const DEFAULT_AGE_LOADS = [
        [18, 30, 0.6],
        [31, 40, 0.7],
        [41, 50, 0.8],
        [51, 60, 0.9],
        [61, 70, 1.0],
    ];

    private ?array $pricingSettingsCache = null;

    /**
     * Calculate quotation based on ages, dates and currency
     */
    public function calculateQuotation(array $ages, string $startDate, string $endDate, string $currencyId): array
    {
        // Calculate trip length (inclusive of both dates)
        $tripLength = $this->calculateTripLength($startDate, $endDate);
        $fixedRate = $this->getFixedRate();

        $total = 0;
        $breakdown = [];

        // Calculate cost for each age
        foreach ($ages as $age) {
            $ageLoad = $this->getAgeLoad($age);
            $subtotal = $fixedRate * $ageLoad * $tripLength;
            $total += $subtotal;

            $breakdown[] = [
                'age' => (int) $age,
                'age_load' => $ageLoad,
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

        // Add 1 because both start and end dates are inclusive
        return $start->diffInDays($end) + 1;
    }

    /**
     * Get age load factor for given age
     *
     * @throws \InvalidArgumentException
     */
    private function getAgeLoad(int $age): float
    {
        foreach ($this->getAgeLoads() as [$minAge, $maxAge, $load]) {
            if ($age >= $minAge && $age <= $maxAge) {
                return $load;
            }
        }

        throw new \InvalidArgumentException("Age {$age} is not within supported age range (18-70)");
    }

    /**
     * Validate if age is within supported range
     */
    public function isValidAge(int $age): bool
    {
        return $age >= 18 && $age <= 70;
    }

    /**
     * Get all age load brackets for reference
     */
    public function getAgeLoadTable(): array
    {
        $table = [];
        foreach ($this->getAgeLoads() as [$minAge, $maxAge, $load]) {
            $table[] = [
                'min_age' => $minAge,
                'max_age' => $maxAge,
                'load_factor' => $load,
            ];
        }

        return $table;
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

    private function getFixedRate(): float
    {
        $fixedRate = $this->getPricingSettings()['fixed_rate'];

        if (!is_numeric($fixedRate) || (float) $fixedRate <= 0) {
            return self::DEFAULT_FIXED_RATE;
        }

        return (float) $fixedRate;
    }

    private function getAgeLoads(): array
    {
        $ageLoads = $this->getPricingSettings()['age_loads'];

        if (!is_array($ageLoads)) {
            return self::DEFAULT_AGE_LOADS;
        }

        $normalized = [];

        foreach ($ageLoads as $entry) {
            if (!is_array($entry) || count($entry) !== 3) {
                continue;
            }

            [$minAge, $maxAge, $load] = $entry;

            if (!is_numeric($minAge) || !is_numeric($maxAge) || !is_numeric($load)) {
                continue;
            }

            $normalized[] = [(int) $minAge, (int) $maxAge, (float) $load];
        }

        return $normalized === [] ? self::DEFAULT_AGE_LOADS : $normalized;
    }

    private function getPricingSettings(): array
    {
        if ($this->pricingSettingsCache !== null) {
            return $this->pricingSettingsCache;
        }

        try {
            $pricingSetting = PricingSetting::query()->latest('id')->first();
        } catch (Throwable) {
            $pricingSetting = null;
        }

        $this->pricingSettingsCache = [
            'fixed_rate' => $pricingSetting?->fixed_rate ?? self::DEFAULT_FIXED_RATE,
            'age_loads' => $pricingSetting?->age_loads ?? self::DEFAULT_AGE_LOADS,
        ];

        return $this->pricingSettingsCache;
    }
}
