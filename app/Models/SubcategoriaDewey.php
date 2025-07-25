<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SubcategoriaDewey extends Model
{
    use HasFactory;
    public $timestamps = false;
    
    protected $table = 'subcategorias_dewey';

    protected $fillable = [
        'categoria_id',
        'nombre',
        'codigo'
    ];

    /**
     * Obtiene la categoría Dewey a la que pertenece esta subcategoría.
     */
    public function categoria(): BelongsTo
    {
        return $this->belongsTo(CategoriaDewey::class, 'categoria_id');
    }

    /**
     * Obtiene los temas Dewey que pertenecen a esta subcategoría.
     */
    public function temasDewey(): HasMany
    {
        return $this->hasMany(TemaDewey::class, 'subcategoria_id');
    }
}