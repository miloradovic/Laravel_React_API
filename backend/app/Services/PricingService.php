<?php

namespace App\Services;

use App\Models\AgeLoadBracket;
use App\Models\Currency;
use App\Models\PricingConfig;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;

class PricingService
{
    /**
     * Calculate quotation based on ages, dates and currency
     *
     * @param  list<int>  $ages
     * @return array{
     *   quotation_id: int,
     *   total: float,
     *   currency_id: string,
     *   trip_length: int,
     *   breakdown: list<array{age: int, age_load: float, subtotal: float}>,
     *   start_date: string,
     *   end_date: string
     * }
     */
    public function calculateQuotation(array $ages, string $startDate, string $endDate, string $currencyId): array
    {
        $config = PricingConfig::getActive();
        $tripLength = $this->calculateTripLength($startDate, $endDate);

        $total = 0;
        $breakdown = [];

        foreach ($ages as $age) {
            $bracket = $this->findBracket($config, $age);
            $subtotal = $config->rate * $bracket->load_factor * $tripLength;
            $total += $subtotal;

            $breakdown[] = [
                'age' => (int) $age,
                'age_load' => $bracket->load_factor,
                'subtotal' => round($subtotal, 2),
            ];
        }

        return [
            'quotation_id' => random_int(1000, 9999),
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

        return (int) $start->diffInDays($end) + 1;
    }

    /**
     * Find the matching bracket for a given age from the active config.
     *
     * @throws \InvalidArgumentException
     */
    private function findBracket(PricingConfig $config, int $age): AgeLoadBracket
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
     *
     * @return list<array{min_age: int, max_age: int, load_factor: float}>
     */
    public function getAgeLoadTable(): array
    {
        $config = PricingConfig::getActive();

        return $config->brackets->map(static fn (AgeLoadBracket $b): array => [
            'min_age' => $b->min_age,
            'max_age' => $b->max_age,
            'load_factor' => $b->load_factor,
        ])->all();
    }

    /**
     * Get the active rate
     */
    public function getRate(): float
    {
        return PricingConfig::getActive()->rate;
    }

    /**
     * Get supported currencies
     *
     * @return Collection<int, Currency>
     */
    public function getSupportedCurrencies(): Collection
    {
        return Currency::query()
            ->active()
            ->orderBy('code')
            ->get(['code', 'name', 'symbol']);
    }
}
