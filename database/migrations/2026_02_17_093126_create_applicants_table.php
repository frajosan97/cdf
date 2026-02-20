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
        Schema::create('applicants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ward_id')->constrained()->onDelete('cascade');
            $table->foreignId('location_id')->constrained()->onDelete('cascade');
            $table->foreignId('institution_id')->constrained()->onDelete('cascade');
            $table->string('type');
            $table->string('student_name')->nullable();
            $table->string('admission_number')->nullable();
            $table->string('parent_name')->nullable();
            $table->string('parent_status')->nullable();
            $table->string('parent_phone_number')->nullable();
            $table->string('parent_id_number')->nullable();
            $table->decimal('amount', 10, 2)->nullable();
            $table->string('decision')->nullable();
            $table->string('decision_reason')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('applicants');
    }
};