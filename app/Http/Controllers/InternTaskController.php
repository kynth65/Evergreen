<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;

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
}