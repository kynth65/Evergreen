<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

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
        // Get the correct base URL
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
            
            // Include images with direct URLs to our controller
            'images' => $this->when($this->relationLoaded('images'), function () use ($baseUrl) {
                return $this->images->map(function ($image) use ($baseUrl) {
                    // Extract just the filename from the path
                    $filename = basename($image->image_path);
                    
                    return [
                        'id' => $image->id,
                        'image_path' => $image->image_path,
                        'is_primary' => $image->is_primary,
                        'sort_order' => $image->sort_order,
                        // Direct path to our simple controller
                        'image_url' => $baseUrl . '/image/' . $filename
                    ];
                });
            }, []),
            
            // Primary image with direct URL
            'primary_image' => $this->when(
                $this->relationLoaded('primaryImage') && $this->primaryImage !== null, 
                function () use ($baseUrl) {
                    // Extract just the filename from the path
                    $filename = basename($this->primaryImage->image_path);
                    
                    return [
                        'id' => $this->primaryImage->id,
                        'image_path' => $this->primaryImage->image_path,
                        'image_url' => $baseUrl . '/image/' . $filename
                    ];
                }
            ),
        ];
    }
}