<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Response;

class ImageController extends Controller
{
    /**
     * Serve images directly from storage
     */
    public function serve($path)
    {
        // The path from database is already relative to public storage
        // So prefix with 'public/' to get correct location
        $fullPath = 'public/' . $path;
        
        // Verify the file exists
        if (!Storage::exists($fullPath)) {
            return response('Image not found', 404);
        }
        
        // Get file contents and MIME type
        $fileContents = Storage::get($fullPath);
        $mimeType = Storage::mimeType($fullPath);
        
        // Return file with proper headers
        return Response::make($fileContents, 200, [
            'Content-Type' => $mimeType,
            'Content-Disposition' => 'inline; filename="' . basename($path) . '"',
            'Cache-Control' => 'public, max-age=86400'
        ]);
    }
}