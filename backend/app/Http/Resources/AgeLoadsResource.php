<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AgeLoadsResource extends JsonResource
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
     * @return array{age_loads: list<array{min_age: int, max_age: int, load_factor: float}>, fixed_rate: float}
     */
    public function toArray(Request $request): array
    {
        /** @var array{age_loads?: list<array{min_age: int, max_age: int, load_factor: float}>, fixed_rate?: float} $result */
        $result = (array) $this->resource;

        return [
            'age_loads' => (array) ($result['age_loads'] ?? []),
            'fixed_rate' => (float) ($result['fixed_rate'] ?? 0.0),
        ];
    }
}
