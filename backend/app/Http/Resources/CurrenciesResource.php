<?php

namespace App\Http\Resources;

use App\Models\Currency;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Collection<int, Currency> */
class CurrenciesResource extends JsonResource
{
    /**
     * Preserve existing response shape without a top-level "data" key.
     *
     * @var string|null
     */
    public static $wrap = null;

    /**
     * Transform the resource into an array.
     *
     * @return array{currencies: list<array{code: string, name: string, symbol: string}>}
     */
    public function toArray(Request $request): array
    {
        /** @var Collection<int, Currency> $currencies */
        $currencies = $this->resource;

        return [
            'currencies' => $currencies
                ->map(static fn (Currency $currency): array => [
                    'code' => $currency->code,
                    'name' => $currency->name,
                    'symbol' => $currency->symbol,
                ])
                ->values()
                ->all(),
        ];
    }
}
