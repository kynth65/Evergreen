<?php
namespace App\Http\Controllers;
use App\Models\Task;
use App\Models\User;
use App\Notifications\EvergreenNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class TaskController extends Controller
{
    /**
     * Display a listing of the tasks.
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
        
        // Filter by submissions that need review
        if ($request->has('needs_review') && $request->needs_review === 'true') {
            $query->needsReview();
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
     * Store a newly created task in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'task_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'instructions' => 'nullable|string',
            'image' => 'nullable|image|max:2048', // 2MB max
            'status' => 'nullable|in:pending,completed,failed',
            'due_date' => 'nullable|date',
            'assigned_to' => 'nullable|exists:users,id',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        $data = $validator->validated();
        
        // Handle image upload
        if ($request->hasFile('image') && $request->file('image')->isValid()) {
            $path = $request->file('image')->store('task-images', 'public');
            // Prepend 'storage/' to the path
            $data['image_path'] = 'storage/' . $path;
        }
        
        // Set the creator
        $data['created_by'] = auth()->id();
        
        $task = Task::create($data);
        
        // Send notification to the assigned intern if provided
        if (isset($data['assigned_to'])) {
            $assignedUser = User::find($data['assigned_to']);
            
            // Check if the assigned user is an intern
            if ($assignedUser && $assignedUser->role === 'intern') {
                $creator = auth()->user();
                $message = "New task assigned: {$task->task_name}";
                
                $assignedUser->notify(new EvergreenNotification(
                    $message,
                    'info',
                    [
                        'task_id' => $task->id,
                        'task_name' => $task->task_name,
                        'assigned_by' => $creator->first_name . ' ' . $creator->last_name,
                        'due_date' => $task->due_date ? $task->due_date->format('Y-m-d') : null
                    ]
                ));
            }
        } else {
            // If no specific user is assigned, notify all interns
            $interns = User::where('role', 'intern')->get();
            
            foreach ($interns as $intern) {
                $creator = auth()->user();
                $message = "New task available: {$task->task_name}";
                
                $intern->notify(new EvergreenNotification(
                    $message,
                    'info',
                    [
                        'task_id' => $task->id,
                        'task_name' => $task->task_name,
                        'created_by' => $creator->first_name . ' ' . $creator->last_name,
                        'due_date' => $task->due_date ? $task->due_date->format('Y-m-d') : null
                    ]
                ));
            }
        }
        
        return response()->json([
            'success' => true,
            'message' => 'Task created successfully',
            'data' => $task->load(['creator:id,first_name,last_name,email'])
        ], 201);
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
     * Update the specified task in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $task = Task::findOrFail($id);
        
        $validator = Validator::make($request->all(), [
            'task_name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'instructions' => 'nullable|string',
            'image' => 'nullable|image|max:2048',
            'status' => 'nullable|in:pending,completed,failed',
            'due_date' => 'nullable|date',
            'assigned_to' => 'nullable|exists:users,id',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        $data = $validator->validated();
        $oldAssignedTo = $task->assigned_to;
        
        // Handle image upload
        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($task->image_path) {
                // Remove 'storage/' prefix if it exists for proper storage deletion
                $storageFilePath = str_replace('storage/', '', $task->image_path);
                Storage::disk('public')->delete($storageFilePath);
            }
            
            // Store in the task-images folder
            $path = $request->file('image')->store('task-images', 'public');
            // Prepend 'storage/' to the path
            $data['image_path'] = 'storage/' . $path;
        }
        
        // Check if there's a new assignee
        if (isset($data['assigned_to']) && $data['assigned_to'] != $oldAssignedTo) {
            $assignedUser = User::find($data['assigned_to']);
            
            // Check if the newly assigned user is an intern
            if ($assignedUser && $assignedUser->role === 'intern') {
                $admin = auth()->user();
                $message = "Task reassigned to you: {$task->task_name}";
                
                $assignedUser->notify(new EvergreenNotification(
                    $message,
                    'info',
                    [
                        'task_id' => $task->id,
                        'task_name' => $task->task_name,
                        'assigned_by' => $admin->first_name . ' ' . $admin->last_name,
                        'due_date' => isset($data['due_date']) ? $data['due_date'] : ($task->due_date ? $task->due_date->format('Y-m-d') : null)
                    ]
                ));
            }
        }
        
        // Check if the due date was updated
        if (isset($data['due_date']) && $data['due_date'] != $task->due_date) {
            // Notify the assigned intern about the due date change
            if ($task->assigned_to) {
                $assignedUser = User::find($task->assigned_to);
                
                if ($assignedUser && $assignedUser->role === 'intern') {
                    $admin = auth()->user();
                    $message = "Due date updated for task: {$task->task_name}";
                    
                    $assignedUser->notify(new EvergreenNotification(
                        $message,
                        'warning',
                        [
                            'task_id' => $task->id,
                            'task_name' => $task->task_name,
                            'updated_by' => $admin->first_name . ' ' . $admin->last_name,
                            'old_due_date' => $task->due_date ? $task->due_date->format('Y-m-d') : null,
                            'new_due_date' => $data['due_date']
                        ]
                    ));
                }
            }
        }
        
        $task->update($data);
        $task = $task->fresh(['creator:id,first_name,last_name,email']);
        
        return response()->json([
            'success' => true,
            'message' => 'Task updated successfully',
            'data' => $task
        ]);
    }
    
    /**
     * Remove the specified task from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $task = Task::findOrFail($id);
        
        // Notify the assigned intern if applicable
        if ($task->assigned_to) {
            $assignedUser = User::find($task->assigned_to);
            
            if ($assignedUser && $assignedUser->role === 'intern') {
                $admin = auth()->user();
                $message = "Task has been removed: {$task->task_name}";
                
                $assignedUser->notify(new EvergreenNotification(
                    $message,
                    'error',
                    [
                        'task_name' => $task->task_name,
                        'removed_by' => $admin->first_name . ' ' . $admin->last_name
                    ]
                ));
            }
        }
        
        // Delete the task image if it exists
        if ($task->image_path) {
            // Remove 'storage/' prefix for proper storage deletion
            $storageFilePath = str_replace('storage/', '', $task->image_path);
            Storage::disk('public')->delete($storageFilePath);
        }
        
        // Delete submission file if it exists
        if ($task->submission_file_path) {
            // Remove 'storage/' prefix for proper storage deletion
            $storageFilePath = str_replace('storage/', '', $task->submission_file_path);
            Storage::disk('public')->delete($storageFilePath);
        }
        
        $task->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Task deleted successfully'
        ]);
    }
    
    /**
     * Update the status of a task.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function updateStatus(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pending,completed,failed',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        $task = Task::findOrFail($id);
        $oldStatus = $task->status;
        $task->status = $request->status;
        $task->save();
        
        // Notify the assigned intern about status change
        if ($task->assigned_to && $oldStatus !== $request->status) {
            $assignedUser = User::find($task->assigned_to);
            
            if ($assignedUser && $assignedUser->role === 'intern') {
                $admin = auth()->user();
                $statusMessages = [
                    'pending' => 'Task has been marked as pending',
                    'completed' => 'Task has been marked as completed',
                    'failed' => 'Task has been marked as failed'
                ];
                $message = "{$statusMessages[$request->status]}: {$task->task_name}";
                $notificationType = $request->status === 'completed' ? 'success' : ($request->status === 'failed' ? 'error' : 'info');
                
                $assignedUser->notify(new EvergreenNotification(
                    $message,
                    $notificationType,
                    [
                        'task_id' => $task->id,
                        'task_name' => $task->task_name,
                        'updated_by' => $admin->first_name . ' ' . $admin->last_name,
                        'old_status' => $oldStatus,
                        'new_status' => $request->status
                    ]
                ));
            }
        }
        
        return response()->json([
            'success' => true,
            'message' => 'Task status updated successfully',
            'data' => $task
        ]);
    }
    
    /**
     * Mark submission as checked.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function markSubmissionChecked(Request $request, $id)
    {
        $task = Task::findOrFail($id);
        
        // Validate that there is a submission to check
        if (!$task->submission_file_path) {
            return response()->json([
                'success' => false,
                'message' => 'This task has no submission to check'
            ], 422);
        }
        
        $task->is_submission_checked = true;
        $task->save();
        
        // Notify the intern that their submission has been reviewed
        if ($task->assigned_to) {
            $assignedUser = User::find($task->assigned_to);
            
            if ($assignedUser && $assignedUser->role === 'intern') {
                $admin = auth()->user();
                $message = "Your submission for '{$task->task_name}' has been reviewed";
                
                $assignedUser->notify(new EvergreenNotification(
                    $message,
                    'success',
                    [
                        'task_id' => $task->id,
                        'task_name' => $task->task_name,
                        'reviewed_by' => $admin->first_name . ' ' . $admin->last_name,
                        'review_date' => now()->toDateTimeString()
                    ]
                ));
            }
        }
        
        return response()->json([
            'success' => true,
            'message' => 'Submission marked as checked',
            'data' => $task
        ]);
    }   
}