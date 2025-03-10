<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('lands', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->unsignedInteger('size')->comment('Size in square meters');
            $table->unsignedInteger('price_per_sqm');
            $table->unsignedInteger('agent_id')->nullable();
            $table->string('location')->nullable();
            $table->text('description')->nullable();
            $table->enum('status', ['available', 'pending', 'sold'])->default('available');
            $table->timestamps();
            
            // If you have an agents table, add foreign key
            // $table->foreign('agent_id')->references('id')->on('agents')->onDelete('set null');
        });
        
        // Create table for land images
        Schema::create('land_images', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('land_id');
            $table->string('image_path');
            $table->boolean('is_primary')->default(false);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
            
            $table->foreign('land_id')->references('id')->on('lands')->onDelete('cascade');
        });
    }
    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('land_images');
        Schema::dropIfExists('lands');
    }
};