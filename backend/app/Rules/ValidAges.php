<?php

namespace App\Rules;

use App\Services\PricingService;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class ValidAges implements ValidationRule
{
    public function __construct(
        private readonly PricingService $pricingService
    ) {}

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_string($value)) {
            $fail('Age must contain only integers separated by commas');

            return;
        }

        foreach (explode(',', $value) as $segment) {
            if ($segment === '' || ! ctype_digit($segment)) {
                $fail('Age must contain only integers separated by commas');

                return;
            }

            $age = (int) $segment;

            if (! $this->pricingService->isValidAge($age)) {
                $fail("Age {$age} is not within any supported age bracket");
            }
        }
    }
}
