<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Response;

class ImageController extends Controller
{
    /**
     * Serve images from storage
     * This bypasses the need for symbolic links
     *
     * @param string $path
     * @return \Illuminate\Http\Response
     */
    public function serve($path = null)
    {
        // Security check to prevent directory traversal
        $path = str_replace('../', '', $path);
        
        $fullPath = 'public/' . $path;
        
        // Check if file exists
        if (!Storage::exists($fullPath)) {
            return Response::make('File not found.', 404);
        }
        
        // Get file content and MIME type
        $file = Storage::get($fullPath);
        $type = Storage::mimeType($fullPath);
        
        // Create response with appropriate headers
        $response = Response::make($file, 200);
        $response->header('Content-Type', $type);
        $response->header('Cache-Control', 'public, max-age=86400');
        
        return $response;
    }
}