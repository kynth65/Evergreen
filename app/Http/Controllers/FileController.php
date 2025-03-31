<?php

namespace App\Http\Controllers;

use App\Models\File;
use App\Models\Folder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class FileController extends Controller
{
    /**
     * Display a listing of the files.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $folderId = $request->query('folder_id');
        $search = $request->query('search');
        $sortField = $request->query('sort', 'name');
        $sortOrder = $request->query('order', 'asc');
        
        $allowedSortFields = ['name', 'size', 'created_at', 'updated_at'];
        $sortField = in_array($sortField, $allowedSortFields) ? $sortField : 'name';
        $sortOrder = in_array($sortOrder, ['asc', 'desc']) ? $sortOrder : 'asc';
        
        $query = File::query();
        
        // Filter by folder
        if ($folderId) {
            $query->where('folder_id', $folderId);
        } else {
            $query->whereNull('folder_id'); // Root files
        }
        
        // Apply search filter
        if ($search) {
            $query->search($search);
        }
        
        // Apply sorting
        $query->orderBy($sortField, $sortOrder);
        
        $files = $query->get();
        
        return response()->json($files);
    }

    /**
     * Store a newly created file in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $request->validate([
            'file' => 'required|file|max:102400', // 100MB max
            'folder_id' => 'nullable|exists:folders,id',
        ]);
        
        $uploadedFile = $request->file('file');
        $originalName = $uploadedFile->getClientOriginalName();
        $extension = $uploadedFile->getClientOriginalExtension();
        $mimeType = $uploadedFile->getMimeType();
        $size = $uploadedFile->getSize();
        
        // Check if a file with the same name already exists in the folder
        $folderId = $request->folder_id;
        $nameExists = File::where('folder_id', $folderId)
                        ->where('name', $originalName)
                        ->whereNull('deleted_at')
                        ->exists();
        
        // If it exists, append a timestamp to make it unique
        if ($nameExists) {
            $name = pathinfo($originalName, PATHINFO_FILENAME);
            $originalName = $name . '_' . time() . '.' . $extension;
        }
        
        // Store the file
        $path = $uploadedFile->store('files/' . Str::random(40));
        
        // Create the file record
        $file = new File();
        $file->name = $originalName;
        $file->folder_id = $folderId;
        $file->path = $path;
        $file->type = $mimeType;
        $file->extension = $extension;
        $file->size = $size;
        $file->created_by = Auth::id();
        $file->save();
        
        return response()->json($file, 201);
    }

    /**
     * Display the specified file.
     *
     * @param  \App\Models\File  $file
     * @return \Illuminate\Http\Response
     */
    public function show(File $file)
    {
        return response()->json($file);
    }

    /**
     * Update the specified file in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\File  $file
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, File $file)
    {
        $validated = $request->validate([
            'name' => [
                'required', 
                'string', 
                'max:255',
                Rule::unique('files')->where(function ($query) use ($request, $file) {
                    return $query->where('folder_id', $file->folder_id)
                                 ->whereNull('deleted_at')
                                 ->where('id', '!=', $file->id);
                }),
            ],
        ]);
        
        $file->name = $validated['name'];
        $file->save();
        
        return response()->json($file);
    }

    /**
     * Remove the specified file from storage.
     *
     * @param  \App\Models\File  $file
     * @return \Illuminate\Http\Response
     */
    public function destroy(File $file)
    {
        $file->delete();
        
        return response()->json(null, 204);
    }

    /**
     * Download the specified file.
     *
     * @param  \App\Models\File  $file
     * @return \Illuminate\Http\Response
     */
    public function download(File $file)
    {
        if (!Storage::exists($file->path)) {
            return response()->json(['message' => 'File not found'], 404);
        }
        
        return Storage::download($file->path, $file->name);
    }

    /**
     * Preview or view the file inline.
     *
     * @param  \App\Models\File  $file
     * @return \Illuminate\Http\Response
     */
    public function preview(File $file)
    {
        if (!Storage::exists($file->path)) {
            return response()->json(['message' => 'File not found'], 404);
        }
        
        $previewableTypes = [
            'image/jpeg', 'image/png', 'image/gif', 'image/svg+xml',
            'application/pdf',
            'text/plain', 'text/html', 'text/css', 'text/javascript',
            'application/json',
        ];
        
        if (in_array($file->type, $previewableTypes)) {
            return response()->file(Storage::path($file->path));
        }
        
        return response()->json(['message' => 'File type not previewable'], 415);
    }

    /**
     * Move file to another folder.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\File  $file
     * @return \Illuminate\Http\Response
     */
    public function move(Request $request, File $file)
    {
        $validated = $request->validate([
            'folder_id' => 'nullable|exists:folders,id',
        ]);
        
        $file->folder_id = $validated['folder_id'] ?? null;
        $file->save();
        
        return response()->json($file);
    }

    /**
     * Get files and folders together (for file browser).
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function browser(Request $request)
    {
        $folderId = $request->query('folder_id');
        $search = $request->query('search');
        $sortField = $request->query('sort', 'name');
        $sortOrder = $request->query('order', 'asc');
        
        // Get folders
        $folderQuery = Folder::query();
        if ($folderId) {
            $folderQuery->where('parent_id', $folderId);
        } else {
            $folderQuery->whereNull('parent_id');
        }
        if ($search) {
            $folderQuery->search($search);
        }
        $folders = $folderQuery->orderBy($sortField, $sortOrder)->get();
        
        // Get files
        $fileQuery = File::query();
        if ($folderId) {
            $fileQuery->where('folder_id', $folderId);
        } else {
            $fileQuery->whereNull('folder_id');
        }
        if ($search) {
            $fileQuery->search($search);
        }
        $files = $fileQuery->orderBy($sortField, $sortOrder)->get();
        
        // Format data for the frontend - convert to plain arrays
        $folderItems = $folders->map(function ($folder) {
            return [
                'id' => $folder->id,
                'name' => $folder->name,
                'type' => 'folder',
                'updatedAt' => $folder->updated_at,
                'createdAt' => $folder->created_at,
            ];
        })->toArray();
        
        $fileItems = $files->map(function ($file) {
            return [
                'id' => $file->id,
                'name' => $file->name,
                'type' => 'file',
                'size' => $file->size,
                'extension' => $file->extension,
                'mimeType' => $file->type,
                'updatedAt' => $file->updated_at,
                'createdAt' => $file->created_at,
            ];
        })->toArray();
        
        // Get current path for breadcrumb
        $breadcrumb = [];
        if ($folderId) {
            $currentFolder = Folder::find($folderId);
            if ($currentFolder) {
                $breadcrumb = $currentFolder->getPath()->map(function ($folder) {
                    return [
                        'id' => $folder->id,
                        'name' => $folder->name,
                    ];
                })->toArray();
            }
        }
        
        // Instead of using Collection merge(), manually combine the arrays
        $allItems = array_merge($folderItems, $fileItems);
        
        return response()->json([
            'items' => $allItems,
            'breadcrumb' => $breadcrumb,
        ]);
    }
}