<?php

namespace App\Http\Controllers;

use App\Http\Requests\QuotationRequest;
use App\Services\PricingService;

class QuotationController extends Controller
{
    private PricingService $pricingService;

    public function __construct(PricingService $pricingService)
    {
        $this->pricingService = $pricingService;
    }

    /**
     * Calculate travel insurance quotation
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function calculate(QuotationRequest $request)
    {
        try {
            // Parse ages from comma-separated string
            $agesString = $request->input('age');
            $ages = array_map('intval', explode(',', $agesString));

            // Validate each age
            foreach ($ages as $age) {
                if (! $this->pricingService->isValidAge($age)) {
                    return response()->json([
                        'error' => "Age {$age} is not within supported range (18-70)",
                    ], 422);
                }
            }

            // Calculate quotation
            $result = $this->pricingService->calculateQuotation(
                $ages,
                $request->input('start_date'),
                $request->input('end_date'),
                $request->input('currency_id')
            );

            // Add quotation ID (in real app, this would be saved to database)
            $result['quotation_id'] = rand(1000, 9999);

            return response()->json($result);

        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'error' => $e->getMessage(),
            ], 422);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'An error occurred while calculating the quotation',
            ], 500);
        }
    }

    /**
     * Get available currencies
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getCurrencies()
    {
        return response()->json([
            'currencies' => $this->pricingService->getSupportedCurrencies(),
        ]);
    }

    /**
     * Get age load table
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getAgeLoads()
    {
        return response()->json([
            'age_loads' => $this->pricingService->getAgeLoadTable(),
            'fixed_rate' => PricingService::FIXED_RATE,
        ]);
    }
}
