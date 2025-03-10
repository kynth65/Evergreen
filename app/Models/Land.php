<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Land extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 
        'size', 
        'price_per_sqm', 
        'agent_id', 
        'location', 
        'description', 
        'status'
    ];

    /**
     * Get the total price of the land
     */
    public function getTotalPriceAttribute()
    {
        return $this->size * $this->price_per_sqm;
    }

    /**
     * Get all images associated with the land
     */
    public function images()
    {
        return $this->hasMany(LandImage::class);
    }

    /**
     * Get the primary image for the land
     */
    public function primaryImage()
    {
        return $this->hasOne(LandImage::class)->where('is_primary', true);
    }

    /**
     * Get the agent associated with the land
     */
    public function agent()
    {
        return $this->belongsTo(User::class, 'agent_id');
    }
}