<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Tag extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'parent_id',
        'name',
    ];

    /**
     * Get the user that owns the tag.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the items that belong to the tag.
     */
    public function items(): BelongsToMany
    {
        return $this->belongsToMany(Item::class);
    }

    /**
     * Get the parent tag.
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(Tag::class, 'parent_id');
    }

    /**
     * Get the child tags.
     */
    public function children(): HasMany
    {
        return $this->hasMany(Tag::class, 'parent_id');
    }
}
