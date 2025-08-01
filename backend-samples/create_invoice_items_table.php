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
        Schema::create('invoice_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invoice_id')->constrained()->onDelete('cascade');
            $table->foreignId('timesheet_id')->constrained()->onDelete('cascade');
            $table->text('description');
            $table->decimal('hours', 8, 2);
            $table->decimal('rate', 8, 2);
            $table->decimal('amount', 10, 2);
            $table->string('temp_name');
            $table->date('period_start');
            $table->date('period_end');
            $table->timestamps();

            // Indexes for better performance
            $table->index('invoice_id');
            $table->index('timesheet_id');
            $table->index(['period_start', 'period_end']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoice_items');
    }
};