<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('item_id')->unique()->constrained()->onDelete('cascade');
            $table->string('status')->default('pending'); // e.g., pending, in_progress, completed
            $table->unsignedTinyInteger('priority')->default(1); // e.g., 1-5
            $table->timestamp('due_date')->nullable();
            $table->unsignedInteger('time_estimate')->nullable(); // in minutes
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};