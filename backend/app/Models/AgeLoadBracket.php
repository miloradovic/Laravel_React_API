<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AgeLoadBracket extends Model
{
    use HasFactory;

    protected $fillable = [
        'pricing_config_id',
        'min_age',
        'max_age',
        'load_factor',
    ];

    protected function casts(): array
    {
        return [
            'min_age' => 'integer',
            'max_age' => 'integer',
            'load_factor' => 'float',
        ];
    }

    public function pricingConfig(): BelongsTo
    {
        return $this->belongsTo(PricingConfig::class);
    }
}
