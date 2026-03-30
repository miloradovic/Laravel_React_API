<?php

namespace App\Http\Controllers;

use App\Http\Requests\QuotationRequest;
use App\Http\Resources\AgeLoadsResource;
use App\Http\Resources\CurrenciesResource;
use App\Http\Resources\QuotationResource;
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
     * @return QuotationResource
     */
    public function calculate(QuotationRequest $request)
    {
        $data = $request->validated();

        $result = $this->pricingService->calculateQuotation(
            $request->ages(),
            $data['start_date'],
            $data['end_date'],
            $data['currency_id']
        );

        return new QuotationResource($result);
    }

    /**
     * Get available currencies
     *
     * @return CurrenciesResource
     */
    public function getCurrencies()
    {
        return new CurrenciesResource($this->pricingService->getSupportedCurrencies());
    }

    /**
     * Get age load table
     *
     * @return AgeLoadsResource
     */
    public function getAgeLoads()
    {
        return new AgeLoadsResource([
            'age_loads' => $this->pricingService->getAgeLoadTable(),
            'rate' => $this->pricingService->getRate(),
        ]);
    }
}
