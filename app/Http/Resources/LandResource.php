<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class LandResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array|\Illuminate\Contracts\Support\Arrayable|\JsonSerializable
     */
    public function toArray($request)
    {
        // Get the correct base URL for the current environment
        $protocol = $request->secure() ? 'https://' : 'http://';
        $baseUrl = $protocol . $request->getHttpHost();
        
        return [
            'id' => $this->id,
            'name' => $this->name,
            'size' => $this->size,
            'price_per_sqm' => $this->price_per_sqm,
            'total_price' => $this->size * $this->price_per_sqm,
            'agent_id' => $this->agent_id,
            'location' => $this->location,
            'description' => $this->description,
            'features' => $this->features,
            'status' => $this->status,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            
            // Include agent if loaded and not null
            'agent' => $this->when($this->relationLoaded('agent') && $this->agent !== null, function () {
                return [
                    'id' => $this->agent->id,
                    'name' => $this->agent->name,
                ];
            }),
            
            // Include images with direct URLs to public directory
            'images' => $this->when($this->relationLoaded('images'), function () use ($baseUrl) {
                return $this->images->map(function ($image) use ($baseUrl) {
                    // Generate direct URL to the file in public directory
                    $imagePath = $image->image_path;
                    
                    // Handle both formats: either "lands/filename.jpg" or just "filename.jpg"
                    $imageUrl = $baseUrl . '/' . (strpos($imagePath, 'lands/') === 0 ? $imagePath : 'lands/' . basename($imagePath));
                    
                    // For migration period: if image doesn't exist in public yet, use fallback controller
                    if (!file_exists(public_path($imagePath)) && !file_exists(public_path('lands/' . basename($imagePath)))) {
                        $imageUrl = $baseUrl . '/image/' . basename($imagePath);
                    }
                    
                    return [
                        'id' => $image->id,
                        'image_path' => $image->image_path,
                        'is_primary' => $image->is_primary,
                        'sort_order' => $image->sort_order,
                        'image_url' => $imageUrl
                    ];
                });
            }, []),
            
            // Primary image with direct URL
            'primary_image' => $this->when(
                $this->relationLoaded('primaryImage') && $this->primaryImage !== null, 
                function () use ($baseUrl) {
                    $imagePath = $this->primaryImage->image_path;
                    
                    // Handle both formats: either "lands/filename.jpg" or just "filename.jpg"
                    $imageUrl = $baseUrl . '/' . (strpos($imagePath, 'lands/') === 0 ? $imagePath : 'lands/' . basename($imagePath));
                    
                    // For migration period: if image doesn't exist in public yet, use fallback controller
                    if (!file_exists(public_path($imagePath)) && !file_exists(public_path('lands/' . basename($imagePath)))) {
                        $imageUrl = $baseUrl . '/image/' . basename($imagePath);
                    }
                    
                    return [
                        'id' => $this->primaryImage->id,
                        'image_path' => $this->primaryImage->image_path,
                        'image_url' => $imageUrl
                    ];
                }
            ),
        ];
    }
}