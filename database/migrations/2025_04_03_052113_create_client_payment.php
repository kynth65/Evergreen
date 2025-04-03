<?php

// database/migrations/YYYY_MM_DD_create_client_payments_table.php
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
            $table->text('address')->nullable();
            $table->enum('payment_type', ['spot_cash', 'installment']);
            $table->integer('installment_years');
            $table->date('start_date');
            $table->date('next_payment_date')->nullable();
            $table->integer('completed_payments')->default(0);
            $table->decimal('total_amount', 12, 2)->default(0);
            $table->enum('payment_status', ['PENDING', 'ONGOING', 'COMPLETED'])->default('PENDING');
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