<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CategoriaDewey extends Model
{
    public $timestamps = false;
    
    protected $table = 'categorias_dewey';

    protected $fillable = [
        'nombre',
        'codigo'
    ];

    /**
     * Obtiene las subcategorías Dewey que pertenecen a esta categoría.
     */
    public function subcategoriasDewey(): HasMany
    {
        return $this->hasMany(SubcategoriaDewey::class, 'categoria_id');
    }
}