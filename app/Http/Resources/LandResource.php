<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class LandResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray($request)
    {
        // Get the correct base URL
        $protocol = $request->secure() ? 'https://' : 'http://';
        $baseUrl = $protocol . $request->getHttpHost();
        
        return [
            'id' => $this->id,
            'name' => $this->name,
            'size' => $this->size,
            'price_per_sqm' => $this->price_per_sqm,
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
            
            // Include images with full URLs - now using the correct path
            'images' => $this->when($this->relationLoaded('images'), function () use ($baseUrl) {
                return $this->images->map(function ($image) use ($baseUrl) {
                    return [
                        'id' => $image->id,
                        'image_path' => $image->image_path,
                        'is_primary' => $image->is_primary,
                        'sort_order' => $image->sort_order,
                        // Direct path to our controller that will serve the image:
                        'image_url' => $baseUrl . '/storage/' . $image->image_path
                    ];
                });
            }, []),
            
            // Primary image with full URL
            'primary_image' => $this->when(
                $this->relationLoaded('primaryImage') && $this->primaryImage !== null, 
                function () use ($baseUrl) {
                    return [
                        'id' => $this->primaryImage->id,
                        'image_path' => $this->primaryImage->image_path,
                        'image_url' => $baseUrl . '/storage/' . $this->primaryImage->image_path
                    ];
                }
            ),
        ];
    }
}