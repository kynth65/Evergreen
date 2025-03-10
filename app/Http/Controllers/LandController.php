<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Land;
use App\Models\LandImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class LandController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Land::with(['primaryImage', 'agent:id,name']);
        
        // Apply filters if provided
        if ($request->has('location')) {
            $query->where('location', $request->location);
        }
        
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        
        // Apply search if provided
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('location', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }
        
        // Apply sorting
        $sortField = $request->input('sort_by', 'created_at');
        $sortDirection = $request->input('sort_dir', 'desc');
        $query->orderBy($sortField, $sortDirection);
        
        $perPage = $request->input('per_page', 10);
        return $query->paginate($perPage);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'size' => 'required|integer|min:0',
            'price_per_sqm' => 'required|integer|min:0',
            'agent_id' => 'nullable|exists:users,id',
            'location' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'status' => 'required|in:available,pending,sold',
            'images' => 'nullable|array',
            'images.*' => 'image|mimes:jpeg,png,jpg|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Create land record
        $land = Land::create($request->only([
            'name', 'size', 'price_per_sqm', 'agent_id', 
            'location', 'description', 'status'
        ]));

        // Handle image uploads
        if ($request->hasFile('images')) {
            $images = $request->file('images');
            foreach ($images as $index => $image) {
                $path = $image->store('lands', 'public');
                
                $landImage = new LandImage([
                    'image_path' => $path,
                    'is_primary' => $index === 0, // First image is primary
                    'sort_order' => $index
                ]);
                
                $land->images()->save($landImage);
            }
        }

        return response()->json([
            'message' => 'Land created successfully',
            'data' => $land->load(['images', 'agent'])
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Land $land)
    {
        return response()->json([
            'data' => $land->load(['images', 'agent'])
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Land $land)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'size' => 'sometimes|required|integer|min:0',
            'price_per_sqm' => 'sometimes|required|integer|min:0',
            'agent_id' => 'nullable|exists:users,id',
            'location' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'status' => 'sometimes|required|in:available,pending,sold',
            'new_images' => 'nullable|array',
            'new_images.*' => 'image|mimes:jpeg,png,jpg|max:2048',
            'remove_image_ids' => 'nullable|array',
            'remove_image_ids.*' => 'exists:land_images,id',
            'primary_image_id' => 'nullable|exists:land_images,id'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Update land record
        $land->update($request->only([
            'name', 'size', 'price_per_sqm', 'agent_id', 
            'location', 'description', 'status'
        ]));

        // Handle image uploads
        if ($request->hasFile('new_images')) {
            $images = $request->file('new_images');
            $currentCount = $land->images()->count();
            
            foreach ($images as $index => $image) {
                $path = $image->store('lands', 'public');
                
                $landImage = new LandImage([
                    'image_path' => $path,
                    'is_primary' => false,
                    'sort_order' => $currentCount + $index
                ]);
                
                $land->images()->save($landImage);
            }
        }

        // Remove images if requested
        if ($request->has('remove_image_ids') && !empty($request->remove_image_ids)) {
            $imagesToDelete = $land->images()->whereIn('id', $request->remove_image_ids)->get();
            
            foreach ($imagesToDelete as $image) {
                // Delete the file from storage
                if (Storage::disk('public')->exists($image->image_path)) {
                    Storage::disk('public')->delete($image->image_path);
                }
                
                // Delete the record
                $image->delete();
            }
        }

        // Update primary image if requested
        if ($request->has('primary_image_id') && $request->primary_image_id) {
            // Reset all images to non-primary
            $land->images()->update(['is_primary' => false]);
            
            // Set the requested image as primary
            $land->images()->where('id', $request->primary_image_id)->update(['is_primary' => true]);
        }

        return response()->json([
            'message' => 'Land updated successfully',
            'data' => $land->fresh()->load(['images', 'agent'])
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Land $land)
    {
        // Get all images
        $images = $land->images;
        
        // Delete all image files
        foreach ($images as $image) {
            if (Storage::disk('public')->exists($image->image_path)) {
                Storage::disk('public')->delete($image->image_path);
            }
        }
        
        // Delete the land (will cascade delete images due to foreign key)
        $land->delete();

        return response()->json([
            'message' => 'Land deleted successfully'
        ]);
    }
    
    /**
     * Get land statistics
     */
    public function getStats()
    {
        $stats = [
            'totalLands' => Land::count(),
            'totalArea' => Land::sum('size'),
            'averagePricePerSqm' => Land::avg('price_per_sqm'),
            'highestPricedLand' => Land::max('price_per_sqm'),
            'statusCounts' => [
                'available' => Land::where('status', 'available')->count(),
                'pending' => Land::where('status', 'pending')->count(),
                'sold' => Land::where('status', 'sold')->count(),
            ],
            'locationCounts' => Land::select('location')
                ->selectRaw('count(*) as count')
                ->groupBy('location')
                ->get()
                ->pluck('count', 'location')
        ];
        
        return response()->json(['data' => $stats]);
    }
}