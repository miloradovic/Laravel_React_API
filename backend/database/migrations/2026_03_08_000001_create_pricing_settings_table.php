<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('pricing_configs', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('version');
            $table->decimal('fixed_rate', 10, 2);
            $table->boolean('is_active')->default(false);
            $table->unsignedBigInteger('activated_by')->nullable();
            $table->timestamp('activated_at')->nullable();
            $table->timestamps();

            $table->unique('version');
            $table->index('is_active');
            $table->foreign('activated_by')->references('id')->on('users')->nullOnDelete();
        });

        Schema::create('age_load_brackets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pricing_config_id')->constrained('pricing_configs')->cascadeOnDelete();
            $table->unsignedTinyInteger('min_age');
            $table->unsignedTinyInteger('max_age');
            $table->decimal('load_factor', 5, 3);
            $table->timestamps();

            $table->index(['pricing_config_id', 'min_age', 'max_age']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('age_load_brackets');
        Schema::dropIfExists('pricing_configs');
    }
};
