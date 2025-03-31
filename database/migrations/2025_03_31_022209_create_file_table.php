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
        Schema::create('files', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->unsignedBigInteger('folder_id')->nullable(); // Folder that contains this file
            $table->string('path'); // Storage path to the actual file
            $table->string('type')->nullable(); // MIME type
            $table->string('extension')->nullable();
            $table->unsignedBigInteger('size')->default(0); // Size in bytes
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamps();
            $table->softDeletes(); // For trash/recycle bin functionality
            
            // Foreign keys
            $table->foreign('folder_id')->references('id')->on('folders')->onDelete('cascade');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
            
            // Indexes for performance
            $table->index('folder_id');
            $table->index('created_by');
            $table->index('type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('files');
    }
};