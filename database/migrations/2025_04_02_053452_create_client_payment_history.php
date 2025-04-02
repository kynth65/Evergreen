<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::dropIfExists('payment_histories');
        
        Schema::create('payment_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_payment_id')->constrained('client_payments')->onDelete('cascade');
            $table->decimal('amount', 12, 2);
            $table->date('payment_date');
            $table->enum('payment_method', ['cash', 'check', 'bank']);
            $table->string('payment_for');
            $table->string('receipt_number');
            $table->text('remarks')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('payment_histories');
    }
};