<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LandImage extends Model
{
    use HasFactory;

    protected $fillable = [
        'land_id',
        'image_path',
        'is_primary',
        'sort_order'
    ];

    /**
     * Get the land that owns the image
     */
    public function land()
    {
        return $this->belongsTo(Land::class);
    }
}