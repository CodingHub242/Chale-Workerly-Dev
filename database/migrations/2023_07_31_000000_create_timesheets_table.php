<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTimesheetsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('timesheets', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('temp_id');
            $table->decimal('total_hours', 8, 2)->default(0);
            $table->decimal('total_pay', 10, 2)->default(0);
            $table->timestamp('submitted_date')->nullable();
            $table->string('status')->default('draft'); // draft, submitted, approved, rejected
            $table->unsignedBigInteger('approved_by')->nullable();
            $table->timestamp('approved_date')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->date('period_start_date');
            $table->date('period_end_date');
            $table->timestamps();
            
            // Foreign key constraints
            $table->foreign('temp_id')->references('id')->on('temps')->onDelete('cascade');
            $table->foreign('approved_by')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('timesheets');
    }
}