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
        Schema::table('timesheets', function (Blueprint $table) {
            $table->foreignId('invoice_id')->nullable()->constrained()->onDelete('set null');
            $table->timestamp('invoiced_at')->nullable();
            
            // Index for better performance when filtering invoiced/non-invoiced timesheets
            $table->index(['invoice_id', 'status']);
            $table->index('invoiced_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('timesheets', function (Blueprint $table) {
            $table->dropForeign(['invoice_id']);
            $table->dropIndex(['invoice_id', 'status']);
            $table->dropIndex(['invoiced_at']);
            $table->dropColumn(['invoice_id', 'invoiced_at']);
        });
    }
};