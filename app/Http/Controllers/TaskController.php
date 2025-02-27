<?php
namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

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
            // Store the file
            $path = $request->file('image')->store('task-images', 'public');
            $data['image_path'] = $path;
            \Log::info('Stored image at path: ' . $path);
        }
        
        // Set the creator
        $data['created_by'] = auth()->id();
        
        $task = Task::create($data);
        
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
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        $data = $validator->validated();
        
        // Handle image upload
        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($task->image_path) {
                Storage::disk('public')->delete($task->image_path);
            }
            
            $data['image_path'] = $request->file('image')->store('task-images', 'public');
        }
        
        $task->update($data);
        
        return response()->json([
            'success' => true,
            'message' => 'Task updated successfully',
            'data' => $task->fresh(['creator:id,first_name,last_name,email'])
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
        
        // Delete the task image if it exists
        if ($task->image_path) {
            Storage::disk('public')->delete($task->image_path);
        }
        
        // Delete submission file if it exists
        if ($task->submission_file_path) {
            Storage::disk('public')->delete($task->submission_file_path);
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
        $task->status = $request->status;
        $task->save();
        
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
        
        return response()->json([
            'success' => true,
            'message' => 'Submission marked as checked',
            'data' => $task
        ]);
    }
}