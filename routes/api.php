<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;



Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::middleware('auth:sanctum')->group(function () {
    // User profile routes
    Route::get('/user', [AuthController::class, 'getProfile']);
    Route::put('/user/profile', [AuthController::class, 'updateProfile']);
    
    // Logout route
    Route::post('/logout', [AuthController::class, 'logout']);
});

// Public routes
Route::post('/signup', [AuthController::class, 'signup']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout']);
