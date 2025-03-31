<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Folder extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name',
        'parent_id',
        'created_by',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /**
     * Get the user that created the folder.
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the parent folder.
     */
    public function parent()
    {
        return $this->belongsTo(Folder::class, 'parent_id');
    }

    /**
     * Get the child folders.
     */
    public function childFolders()
    {
        return $this->hasMany(Folder::class, 'parent_id');
    }

    /**
     * Get the files in this folder.
     */
    public function files()
    {
        return $this->hasMany(File::class);
    }

    /**
     * Check if folder has any files or subfolders.
     */
    public function isEmpty()
    {
        return $this->files()->count() === 0 && $this->childFolders()->count() === 0;
    }

    /**
     * Get the path to the folder - all parent folders in order
     */
    public function getPath()
    {
        $path = collect([]);
        $folder = $this;

        while ($folder) {
            $path->prepend($folder);
            $folder = $folder->parent;
        }

        return $path;
    }

    /**
     * Scope a query to only include root folders.
     */
    public function scopeRoot($query)
    {
        return $query->whereNull('parent_id');
    }

    /**
     * Scope a query to search by name.
     */
    public function scopeSearch($query, $searchTerm)
    {
        if ($searchTerm) {
            return $query->where('name', 'like', "%{$searchTerm}%");
        }
        
        return $query;
    }
}