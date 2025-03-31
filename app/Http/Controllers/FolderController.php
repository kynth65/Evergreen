<?php

namespace App\Http\Controllers;

use App\Models\Folder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class FolderController extends Controller
{
    /**
     * Display a listing of the folders.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $parentId = $request->query('parent_id');
        $search = $request->query('search');
        $sortField = $request->query('sort', 'name');
        $sortOrder = $request->query('order', 'asc');
        
        $allowedSortFields = ['name', 'created_at', 'updated_at'];
        $sortField = in_array($sortField, $allowedSortFields) ? $sortField : 'name';
        $sortOrder = in_array($sortOrder, ['asc', 'desc']) ? $sortOrder : 'asc';
        
        $query = Folder::query();
        
        // Filter by parent folder
        if ($parentId) {
            $query->where('parent_id', $parentId);
        } else {
            $query->whereNull('parent_id'); // Root folders
        }
        
        // Apply search filter
        if ($search) {
            $query->search($search);
        }
        
        // Apply sorting
        $query->orderBy($sortField, $sortOrder);
        
        $folders = $query->get();
        
        return response()->json($folders);
    }

    /**
     * Store a newly created folder in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => [
                'required', 
                'string', 
                'max:255',
                Rule::unique('folders')->where(function ($query) use ($request) {
                    return $query->where('parent_id', $request->parent_id)
                                 ->whereNull('deleted_at');
                }),
            ],
            'parent_id' => 'nullable|exists:folders,id',
        ]);
        
        $folder = new Folder();
        $folder->name = $validated['name'];
        $folder->parent_id = $validated['parent_id'] ?? null;
        $folder->created_by = Auth::id();
        $folder->save();
        
        return response()->json($folder, 201);
    }

    /**
     * Display the specified folder.
     *
     * @param  \App\Models\Folder  $folder
     * @return \Illuminate\Http\Response
     */
    public function show(Folder $folder)
    {
        return response()->json($folder);
    }

    /**
     * Update the specified folder in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Folder  $folder
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, Folder $folder)
    {
        $validated = $request->validate([
            'name' => [
                'required', 
                'string', 
                'max:255',
                Rule::unique('folders')->where(function ($query) use ($request, $folder) {
                    return $query->where('parent_id', $folder->parent_id)
                                 ->whereNull('deleted_at')
                                 ->where('id', '!=', $folder->id);
                }),
            ],
        ]);
        
        $folder->name = $validated['name'];
        $folder->save();
        
        return response()->json($folder);
    }

    /**
     * Remove the specified folder from storage.
     *
     * @param  \App\Models\Folder  $folder
     * @return \Illuminate\Http\Response
     */
    public function destroy(Folder $folder)
    {
        $folder->delete();
        
        return response()->json(null, 204);
    }

    /**
     * Get the folder breadcrumb path.
     *
     * @param  \App\Models\Folder  $folder
     * @return \Illuminate\Http\Response
     */
    public function path(Folder $folder)
    {
        $path = $folder->getPath();
        
        return response()->json($path);
    }

    /**
     * Move folder to another parent folder.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Folder  $folder
     * @return \Illuminate\Http\Response
     */
    public function move(Request $request, Folder $folder)
    {
        $validated = $request->validate([
            'parent_id' => 'nullable|exists:folders,id',
        ]);
        
        // Prevent moving a folder into itself or any of its descendants
        if ($validated['parent_id']) {
            $parentFolder = Folder::findOrFail($validated['parent_id']);
            $parentPath = $parentFolder->getPath()->pluck('id')->toArray();
            
            if (in_array($folder->id, $parentPath)) {
                return response()->json([
                    'message' => 'Cannot move a folder into itself or its descendants'
                ], 422);
            }
        }
        
        $folder->parent_id = $validated['parent_id'] ?? null;
        $folder->save();
        
        return response()->json($folder);
    }
}