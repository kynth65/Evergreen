<?php

namespace App\Http\Controllers;
use App\Models\Task;
use App\Models\User;
use App\Notifications\EvergreenNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class InternTaskController extends Controller
{
    /**
     * Display a listing of tasks for interns.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $query = Task::with(['creator:id,first_name,last_name,email']);
        
        // Filter by status if provided
        if ($request->has('status')) {
            $query->byStatus($request->status);
        }
        
        // Filter overdue tasks
        if ($request->has('overdue') && $request->overdue === 'true') {
            $query->overdue();
        }
        
        // Sort tasks
        $sortField = $request->input('sort_by', 'created_at');
        $sortDirection = $request->input('sort_dir', 'desc');
        $query->orderBy($sortField, $sortDirection);
        
        $tasks = $query->paginate($request->input('per_page', 15));
        
        return response()->json([
            'success' => true,
            'data' => $tasks
        ]);
    }
    
    /**
     * Display the specified task.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $task = Task::with(['creator:id,first_name,last_name,email'])->findOrFail($id);
        
        return response()->json([
            'success' => true,
            'data' => $task
        ]);
    }
    
    /**
     * Submit task work for review by admin.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function submitWork(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'submission_file' => 'required|file|max:10240', // 10MB max
            'comments' => 'nullable|string',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        $task = Task::findOrFail($id);
        
        // Check if task has already been completed
        if ($task->status === 'completed') {
            return response()->json([
                'success' => false,
                'message' => 'This task has already been marked as completed and cannot be resubmitted.'
            ], 422);
        }
        
        // Handle file upload
        if ($request->hasFile('submission_file') && $request->file('submission_file')->isValid()) {
            // Delete old submission file if exists
            if ($task->submission_file_path) {
                // Remove 'storage/' prefix if it exists for proper storage deletion
                $storageFilePath = str_replace('storage/', '', $task->submission_file_path);
                Storage::disk('public')->delete($storageFilePath);
            }
            
            // Store the file
            $path = $request->file('submission_file')->store('task-submissions', 'public');
            
            // Update task with the submission details
            $task->submission_file_path = 'storage/' . $path;
            $task->submission_date = now();
            $task->is_submission_checked = false;
            $task->submission_comments = $request->input('comments');
            $task->save();
            
            // Notify admins about the new submission
            $admins = User::whereIn('role', ['admin', 'superadmin'])->get();
            $intern = auth()->user();
            
            foreach ($admins as $admin) {
                $message = "New task submission received from {$intern->first_name} {$intern->last_name} for task: {$task->task_name}";
                
                $admin->notify(new EvergreenNotification(
                    $message,
                    'info',
                    [
                        'task_id' => $task->id,
                        'task_name' => $task->task_name,
                        'submitted_by' => $intern->first_name . ' ' . $intern->last_name,
                        'submission_date' => $task->submission_date->toDateTimeString(),
                        'needs_review' => true,
                        'comments' => $task->submission_comments
                    ]
                ));
            }
            
            return response()->json([
                'success' => true,
                'message' => 'Task submission received. An admin will review your work.',
                'data' => $task->fresh()
            ]);
        }
        
        return response()->json([
            'success' => false,
            'message' => 'There was an error uploading your submission.'
        ], 500);
    }
    
    /**
     * Update the status of a task by intern.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function updateStatus(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pending,completed,failed',
            'comments' => 'nullable|string'
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        $task = Task::findOrFail($id);
        
        // Ensure the task is assigned to the authenticated intern
        if ($task->assigned_to !== auth()->id() && !$task->assigned_to) {
            // If the task isn't assigned to anyone, assign it to this intern
            $task->assigned_to = auth()->id();
        } elseif ($task->assigned_to !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorized to update this task status'
            ], 403);
        }
        
        $oldStatus = $task->status;
        $task->status = $request->status;
        
        if ($request->has('comments')) {
            $task->submission_comments = $request->comments;
        }
        
        $task->save();
        
        // Notify admins about the status change
        if ($oldStatus !== $request->status) {
            $admins = User::whereIn('role', ['admin', 'superadmin'])->get();
            $intern = auth()->user();
            
            $statusMessages = [
                'pending' => 'Task has been marked as pending',
                'completed' => 'Task has been marked as completed',
                'failed' => 'Task has been marked as failed'
            ];
            
            $message = "{$statusMessages[$request->status]} by {$intern->first_name} {$intern->last_name}: {$task->task_name}";
            $notificationType = $request->status === 'completed' ? 'success' : ($request->status === 'failed' ? 'warning' : 'info');
            
            foreach ($admins as $admin) {
                $admin->notify(new EvergreenNotification(
                    $message,
                    $notificationType,
                    [
                        'task_id' => $task->id,
                        'task_name' => $task->task_name,
                        'updated_by' => $intern->first_name . ' ' . $intern->last_name,
                        'old_status' => $oldStatus,
                        'new_status' => $request->status,
                        'comments' => $request->comments ?? null
                    ]
                ));
            }
        }
        
        return response()->json([
            'success' => true,
            'message' => 'Task status updated successfully',
            'data' => $task->fresh()
        ]);
    }
    
    /**
     * Accept a task assigned to an intern.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function acceptTask($id)
    {
        $task = Task::findOrFail($id);
        
        // Check if the task is already assigned to another intern
        if ($task->assigned_to && $task->assigned_to !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'This task is already assigned to another intern'
            ], 403);
        }
        
        // Assign the task to the current intern
        $task->assigned_to = auth()->id();
        $task->save();
        
        // Notify the admin who created the task
        $creator = User::find($task->created_by);
        $intern = auth()->user();
        
        if ($creator && ($creator->role === 'admin' || $creator->role === 'superadmin')) {
            $message = "{$intern->first_name} {$intern->last_name} has accepted task: {$task->task_name}";
            
            $creator->notify(new EvergreenNotification(
                $message,
                'success',
                [
                    'task_id' => $task->id,
                    'task_name' => $task->task_name,
                    'accepted_by' => $intern->first_name . ' ' . $intern->last_name,
                    'accepted_at' => now()->toDateTimeString()
                ]
            ));
        }
        
        return response()->json([
            'success' => true,
            'message' => 'Task assigned to you successfully',
            'data' => $task->fresh()
        ]);
    }
    
    /**
     * Request more time for a task.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function requestMoreTime(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'requested_days' => 'required|integer|min:1|max:30',
            'reason' => 'required|string|max:500'
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        $task = Task::findOrFail($id);
        
        // Ensure the task is assigned to the authenticated intern
        if ($task->assigned_to !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorized to request more time for this task'
            ], 403);
        }
        
        // Notify admins about the time extension request
        $admins = User::whereIn('role', ['admin', 'superadmin'])->get();
        $intern = auth()->user();
        $requestedDays = $request->requested_days;
        $reason = $request->reason;
        
        // Store the request information in the task
        $task->time_extension_requested = true;
        $task->time_extension_days = $requestedDays;
        $task->time_extension_reason = $reason;
        $task->time_extension_requested_at = now();
        $task->save();
        
        // Send notifications to admins
        foreach ($admins as $admin) {
            $message = "{$intern->first_name} {$intern->last_name} has requested {$requestedDays} more days for task: {$task->task_name}";
            
            $admin->notify(new EvergreenNotification(
                $message,
                'warning',
                [
                    'task_id' => $task->id,
                    'task_name' => $task->task_name,
                    'requested_by' => $intern->first_name . ' ' . $intern->last_name,
                    'requested_days' => $requestedDays,
                    'reason' => $reason,
                    'current_due_date' => $task->due_date ? $task->due_date->format('Y-m-d') : null,
                    'requested_at' => now()->toDateTimeString()
                ]
            ));
        }
        
        return response()->json([
            'success' => true,
            'message' => 'Time extension request submitted successfully',
            'data' => $task->fresh()
        ]);
    }
}