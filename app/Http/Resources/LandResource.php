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
        // Get base URL for the current request
        $protocol = $request->secure() ? 'https://' : 'http://';
        $baseUrl = $protocol . $request->getHttpHost();
        
        // Transform the data
        return [
            'id' => $this->id,
            'name' => $this->name,
            'size' => $this->size,
            'price_per_sqm' => $this->price_per_sqm,
            'total_price' => $this->total_price,
            'agent_id' => $this->agent_id,
            'location' => $this->location,
            'description' => $this->description,
            'features' => $this->features,
            'status' => $this->status,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            
            // Include agent if loaded
            'agent' => $this->when($this->relationLoaded('agent'), function () {
                return [
                    'id' => $this->agent->id,
                    'name' => $this->agent->name,
                    // Add other agent fields as needed
                ];
            }),
            
            // Include images with full URLs
            'images' => $this->when($this->relationLoaded('images'), function () use ($baseUrl) {
                return $this->images->map(function ($image) use ($baseUrl) {
                    return [
                        'id' => $image->id,
                        'image_path' => $image->image_path,
                        'is_primary' => $image->is_primary,
                        'sort_order' => $image->sort_order,
                        'image_url' => $baseUrl . '/storage/' . $image->image_path
                    ];
                });
            }),
            
            // Primary image with full URL 
            'primary_image' => $this->when($this->relationLoaded('primaryImage') && $this->primaryImage, function () use ($baseUrl) {
                return [
                    'id' => $this->primaryImage->id,
                    'image_path' => $this->primaryImage->image_path,
                    'image_url' => $baseUrl . '/storage/' . $this->primaryImage->image_path
                ];
            }),
        ];
    }
}