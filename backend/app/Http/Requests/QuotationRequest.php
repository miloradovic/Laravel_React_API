<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

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
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'age' => [
                'required',
                'string',
                'regex:/^(\d{1,2})(,\d{1,2})*$/', // Comma-separated ages like "28,35"
                function ($attribute, $value, $fail) {
                    $ages = explode(',', $value);
                    foreach ($ages as $age) {
                        $ageInt = (int) trim($age);
                        if ($ageInt < 18 || $ageInt > 70) {
                            $fail("Age {$ageInt} must be between 18 and 70");
                        }
                    }
                },
            ],
            'currency_id' => 'required|string|in:EUR,GBP,USD',
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
            'age.regex' => 'Age must be in format "28" or "28,35" for multiple travelers',
            'currency_id.required' => 'Currency is required',
            'currency_id.in' => 'Currency must be EUR, GBP, or USD',
            'start_date.required' => 'Start date is required',
            'start_date.date_format' => 'Start date must be in YYYY-MM-DD format',
            'start_date.after_or_equal' => 'Start date must be today or in the future',
            'end_date.required' => 'End date is required',
            'end_date.date_format' => 'End date must be in YYYY-MM-DD format',
            'end_date.after' => 'End date must be after start date',
        ];
    }
}
