<?php

namespace App\Http\Requests;

use App\Services\PricingService;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class QuotationRequest extends FormRequest
{
    /** @var array<int, string>|null */
    private ?array $supportedCurrencyCodes = null;

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Authorization handled by JWT middleware
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'age' => [
                'bail',
                'required',
                'string',
                fn (string $attribute, string $value, Closure $fail) => $this->validateCommaSeparatedIntegers($value, $fail),
                fn (string $attribute, string $value, Closure $fail) => $this->validateAgeBrackets($value, $fail),
            ],
            'currency_id' => ['required', 'string', Rule::in($this->getSupportedCurrencyCodes())],
            'start_date' => [
                'required',
                'date_format:Y-m-d',
                'after_or_equal:today',
            ],
            'end_date' => [
                'required',
                'date_format:Y-m-d',
                'after:start_date',
            ],
        ];
    }

    /**
     * Get custom error messages for validation rules.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        $supportedCurrencyCodes = implode(', ', $this->getSupportedCurrencyCodes());

        return [
            'age.required' => 'Age is required',
            'currency_id.required' => 'Currency is required',
            'currency_id.in' => "Currency must be one of: {$supportedCurrencyCodes}",
            'start_date.required' => 'Start date is required',
            'start_date.date_format' => 'Start date must be in YYYY-MM-DD format',
            'start_date.after_or_equal' => 'Start date must be today or in the future',
            'end_date.required' => 'End date is required',
            'end_date.date_format' => 'End date must be in YYYY-MM-DD format',
            'end_date.after' => 'End date must be after start date',
        ];
    }

    /**
     * Normalize common fields before validation.
     */
    protected function prepareForValidation(): void
    {
        $age = $this->input('age');
        $currencyId = $this->input('currency_id');

        $this->merge([
            'age' => is_string($age) ? preg_replace('/\s+/', '', $age) : $age,
            'currency_id' => is_string($currencyId) ? strtoupper(trim($currencyId)) : $currencyId,
        ]);
    }

    /**
     * @return array<int, string>
     */
    private function getSupportedCurrencyCodes(): array
    {
        if ($this->supportedCurrencyCodes !== null) {
            return $this->supportedCurrencyCodes;
        }

        $this->supportedCurrencyCodes = $this->pricingService()->getSupportedCurrencyCodes();

        return $this->supportedCurrencyCodes;
    }

    private function validateAgeBrackets(string $ageList, Closure $fail): void
    {
        $pricingService = $this->pricingService();

        foreach ($this->parseAges($ageList) as $age) {
            if (! $pricingService->isValidAge($age)) {
                $fail("Age {$age} is not within any supported age bracket");
            }
        }
    }

    private function validateCommaSeparatedIntegers(string $value, Closure $fail): void
    {
        foreach (explode(',', $value) as $segment) {
            if ($segment === '' || ! ctype_digit($segment)) {
                $fail('Age must contain only integers separated by commas');

                return;
            }
        }
    }

    /**
     * @return array<int, int>
     */
    private function parseAges(string $ageList): array
    {
        return array_map(
            static fn (string $age) => (int) trim($age),
            explode(',', $ageList)
        );
    }

    private function pricingService(): PricingService
    {
        return new PricingService;
    }
}
