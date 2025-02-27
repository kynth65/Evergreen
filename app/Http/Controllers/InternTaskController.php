<?php
namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

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
                Storage::disk('public')->delete($task->submission_file_path);
            }
            
            // Store the file
            $path = $request->file('submission_file')->store('task-submissions', 'public');
            
            // Update task with the submission details
            $task->submission_file_path = $path;
            $task->submission_date = now();
            $task->is_submission_checked = false;
            $task->save();
            
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
}