<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TokenResource extends JsonResource
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
     * @return array{access_token: string, token_type: string, expires_in: int}
     */
    public function toArray(Request $request): array
    {
        return [
            'access_token' => (string) $this->resource,
            'token_type' => 'bearer',
            'expires_in' => (int) config('jwt.ttl', 0) * 60,
        ];
    }
}
