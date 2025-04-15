<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Log;

class ImageController extends Controller
{
    /**
     * Serve images from storage directly
     *
     * @param string $path
     * @return \Illuminate\Http\Response
     */
    public function serve($path = null)
    {
        // Add logging in production to help debug
        Log::info('Image requested:', ['path' => $path]);
        
        // Security check to prevent directory traversal
        $path = str_replace('../', '', $path);
        
        // The path in the database is already relative to the public disk
        // So we add 'public/' to get the actual storage path
        $fullPath = 'public/' . $path;
        
        // Check if file exists
        if (!Storage::exists($fullPath)) {
            Log::warning('Image not found in storage:', [
                'requested_path' => $path,
                'full_path' => $fullPath
            ]);
            
            return Response::make('Image not found', 404);
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