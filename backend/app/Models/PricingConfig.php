<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Cache;

class PricingConfig extends Model
{
    use HasFactory;

    protected $table = 'pricing_configs';

    protected $fillable = [
        'version',
        'fixed_rate',
        'is_active',
        'activated_by',
        'activated_at',
    ];

    protected function casts(): array
    {
        return [
            'fixed_rate' => 'float',
            'is_active' => 'boolean',
            'activated_at' => 'datetime',
        ];
    }

    public function brackets(): HasMany
    {
        return $this->hasMany(AgeLoadBracket::class);
    }

    public function activatedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'activated_by');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Get the currently active pricing config with its brackets.
     */
    public static function getActive(): self
    {
        return Cache::rememberForever('pricing_config:active', function () {
            return self::query()
                ->active()
                ->with('brackets')
                ->latest('version')
                ->firstOrFail();
        });
    }

    /**
     * Activate this config and deactivate all others.
     */
    public function activate(?int $userId = null): void
    {
        self::query()->where('is_active', true)->update(['is_active' => false]);

        $this->update([
            'is_active' => true,
            'activated_by' => $userId,
            'activated_at' => now(),
        ]);

        self::clearCache();
    }

    /**
     * Get the next version number.
     */
    public static function nextVersion(): int
    {
        return (int) self::query()->max('version') + 1;
    }

    /**
     * Clear the cached active config.
     */
    public static function clearCache(): void
    {
        Cache::forget('pricing_config:active');
    }

    protected static function booted(): void
    {
        static::saved(fn () => self::clearCache());
        static::deleted(fn () => self::clearCache());
    }
}
