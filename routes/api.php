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
use App\Http\Controllers\FolderController;
use App\Http\Controllers\FileController;
use App\Http\Controllers\ClientPaymentController;
use App\Http\Controllers\ImageController;


Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('storage/{path?}', [ImageController::class, 'serve'])
     ->where('path', '.*'); // Allow any path structure
     
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

Route::middleware(['auth:sanctum'])->group(function () {
    // File Browser (combined files and folders)
    Route::get('/file-browser', [FileController::class, 'browser']);
    
    // Folders
    Route::apiResource('folders', FolderController::class);
    Route::get('/folders/{folder}/path', [FolderController::class, 'path']);
    Route::put('/folders/{folder}/move', [FolderController::class, 'move']);
    
    // Files
    Route::apiResource('files', FileController::class);
    Route::get('/files/{file}/download', [FileController::class, 'download'])->name('files.download');
    Route::get('/files/{file}/preview', [FileController::class, 'preview'])->name('files.preview');
    Route::put('/files/{file}/move', [FileController::class, 'move']);
});

Route::prefix('client-payments')->group(function () {
    // Get all client payments
    Route::get('/', [ClientPaymentController::class, 'index']);
    
    // Create a new client payment
    Route::post('/', [ClientPaymentController::class, 'store']);
    
    // Get a specific client payment
    Route::get('/{id}', [ClientPaymentController::class, 'show']);
    
    // Update a client payment
    Route::put('/{id}', [ClientPaymentController::class, 'update']);
    
    // Delete a client payment
    Route::delete('/{id}', [ClientPaymentController::class, 'destroy']);
    
    // Record a payment for an installment plan
    Route::post('/{id}/record-payment', [ClientPaymentController::class, 'recordPayment']);

    // get all payment transactions for a specific client payment
    Route::get('/{id}/transactions', [ClientPaymentController::class, 'getTransactions']);

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
