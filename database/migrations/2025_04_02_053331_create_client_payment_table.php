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
        Schema::create('client_payments', function (Blueprint $table) {
            $table->id();
            $table->string('client_name');
            $table->string('contact_number');
            $table->string('email')->nullable();
            $table->string('address')->nullable();
            $table->foreignId('lot_id')->constrained('lots')->onDelete('cascade');
            $table->integer('installment_years');
            $table->integer('total_payments');
            $table->integer('completed_payments')->default(0);
            $table->enum('payment_status', ['COMPLETED', 'IN_PROGRESS', 'OVERDUE', 'NOT_STARTED'])->default('NOT_STARTED');
            $table->date('start_date');
            $table->date('next_payment_date')->nullable();
            $table->text('payment_notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('client_payments');
    }
};