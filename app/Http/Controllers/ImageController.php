<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class ImageController extends Controller
{
    /**
     * Serve images directly from storage
     */
    public function serveImage($filename)
    {
        // Images are stored in 'public/lands/{filename}'
        $path = 'public/lands/' . $filename;
        
        Log::info("Attempting to serve image: " . $path);
        
        // Check if file exists
        if (!Storage::exists($path)) {
            Log::error("Image not found: " . $path);
            return response('Image not found', 404);
        }
        
        // Get file content and mime type
        $file = Storage::get($path);
        $type = Storage::mimeType($path);
        
        // Return file with appropriate headers
        return response($file)
            ->header('Content-Type', $type)
            ->header('Cache-Control', 'public, max-age=86400');
    }
}