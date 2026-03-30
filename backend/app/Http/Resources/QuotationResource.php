<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class QuotationResource extends JsonResource
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
    public function toArray(Request $request): array
    {
        /** @var array<string, mixed> $result */
        $result = (array) $this->resource;

        return [
            'quotation_id' => (int) ($result['quotation_id'] ?? 0),
            'total' => (float) ($result['total'] ?? 0.0),
            'currency_id' => (string) ($result['currency_id'] ?? ''),
            'trip_length' => (int) ($result['trip_length'] ?? 0),
            'breakdown' => (array) ($result['breakdown'] ?? []),
            'start_date' => (string) ($result['start_date'] ?? ''),
            'end_date' => (string) ($result['end_date'] ?? ''),
        ];
    }
}
