<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Log;

class ImageController extends Controller
{
    /**
     * Serve images as a fallback method
     * This is mainly for backward compatibility with old image paths
     */
    public function serveImage($filename)
    {
        // Check if the file exists in the public directory
        $path = public_path('lands/' . $filename);
        
        if (!file_exists($path)) {
            // Fallback to storage if not in public directory
            $storagePath = storage_path('app/public/lands/' . $filename);
            
            if (!file_exists($storagePath)) {
                Log::error("Image not found: " . $filename);
                return response('Image not found', 404);
            }
            
            $path = $storagePath;
        }
        
        // Get file content and determine MIME type
        $file = file_get_contents($path);
        $type = mime_content_type($path);
        
        // Return file with appropriate headers
        return Response::make($file, 200, [
            'Content-Type' => $type,
            'Cache-Control' => 'public, max-age=86400'
        ]);
    }
}