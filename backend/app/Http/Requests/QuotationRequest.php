<?php

namespace App\Http\Requests;

use App\Rules\ValidAges;
use App\Services\PricingService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class QuotationRequest extends FormRequest
{
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
     * @return array<string, array<mixed>|string>
     */
    public function rules(PricingService $pricingService): array
    {
        return [
            'age' => [
                'bail',
                'required',
                'string',
                new ValidAges($pricingService),
            ],
            'currency_id' => [
                'required',
                'string',
                Rule::exists('currencies', 'code')->where(
                    static fn ($query) => $query->where('is_active', true)
                ),
            ],
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
        return [
            'age.required' => 'Age is required',
            'currency_id.required' => 'Currency is required',
            'currency_id.exists' => 'Currency must be supported',
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
     * @return list<int>
     */
    public function ages(): array
    {
        $ageList = (string) $this->validated('age');

        return array_map('intval', explode(',', $ageList));
    }
}
