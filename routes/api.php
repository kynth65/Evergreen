<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\LandController;
use App\Http\Controllers\LotController;
use App\Http\Controllers\AccountManagementController; 
use App\Http\Controllers\TaskController;
use App\Http\Controllers\InternTaskController;
use App\Http\Controllers\NotificationController;

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

//Routes for Notifications
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::put('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::put('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
    Route::post('/notifications/send', [NotificationController::class, 'sendNotification']);
    Route::post('/notifications/test', [NotificationController::class, 'createTestNotification']);
});

//Super Admin Routes
Route::middleware(['auth:sanctum'])->group(function () {
    Route::apiResource('users', AccountManagementController::class);
    Route::get('roles', function() {
        return response()->json([
            'roles' => ['superadmin', 'admin', 'agent', 'intern']
        ]);
    });
});

//Admin Routes
//Task Management Routes
Route::middleware(['auth:sanctum', 'role:admin,superadmin'])->prefix('/admin')->group(function () {
    Route::get('/tasks', [TaskController::class, 'index']);
    Route::post('/tasks', [TaskController::class, 'store']);
    Route::get('/tasks/{id}', [TaskController::class, 'show']);
    Route::put('/tasks/{id}', [TaskController::class, 'update']);
    Route::delete('/tasks/{id}', [TaskController::class, 'destroy']);
    Route::patch('/tasks/{id}/status', [TaskController::class, 'updateStatus']);
    // Routes for checking the submission files
    Route::patch('/tasks/{id}/submission/check', [TaskController::class, 'markSubmissionChecked']);
});

//Land Management Routes
Route::get('lands/stats', [LandController::class, 'getStats']);
Route::apiResource('lands', LandController::class);

//Lots Management Routes
Route::apiResource('lots', LotController::class);

// Intern Routes
Route::middleware(['auth:sanctum', 'role:intern'])->prefix('/intern')->group(function () {
    // Basic task routes
    Route::get('/tasks', [InternTaskController::class, 'index']);
    Route::get('/tasks/{id}', [InternTaskController::class, 'show']);
    
    // Routes for submitting task work
    Route::post('/tasks/{id}/submit', [InternTaskController::class, 'submitWork']);
    
    // New routes for additional functionality
    Route::patch('/tasks/{id}/status', [InternTaskController::class, 'updateStatus']);
    Route::post('/tasks/{id}/accept', [InternTaskController::class, 'acceptTask']);
    Route::post('/tasks/{id}/request-more-time', [InternTaskController::class, 'requestMoreTime']);
});

//Temporary Register
Route::post('/register', [AccountManagementController::class, 'store']);
