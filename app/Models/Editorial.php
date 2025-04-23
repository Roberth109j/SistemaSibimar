<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Editorial extends Model
{
    use HasFactory;

    protected $table = 'editoriales';

    protected $fillable = [
        'nombre',
        'ciudad_id'
    ];

    /**
     * Obtiene la ciudad a la que pertenece la editorial.
     */
    public function ciudad(): BelongsTo
    {
        return $this->belongsTo(Ciudad::class);
    }

    /**
     * Obtiene los libros publicados por esta editorial.
     */
    public function libros(): HasMany
    {
        return $this->hasMany(Libro::class);
    }
}