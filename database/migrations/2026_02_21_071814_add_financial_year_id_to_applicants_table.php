<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('applicants', function (Blueprint $table) {
            // Add financial_year_id column
            if (!Schema::hasColumn('applicants', 'financial_year_id')) {
                $table->foreignId('financial_year_id')
                    ->nullable()
                    ->after('ward_id')
                    ->constrained('financial_years')
                    ->nullOnDelete();

                $table->index('financial_year_id');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('applicants', function (Blueprint $table) {
            if (Schema::hasColumn('applicants', 'financial_year_id')) {
                $table->dropForeign(['financial_year_id']);
                $table->dropColumn('financial_year_id');
            }
        });
    }
};