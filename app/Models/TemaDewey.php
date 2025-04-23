<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TemaDewey extends Model
{
    public $timestamps = false;
    
    protected $table = 'temas_dewey';

    protected $fillable = [
        'subcategoria_id',
        'nombre',
        'codigo'
    ];

    /**
     * Obtiene la subcategoría Dewey a la que pertenece este tema.
     */
    public function subcategoriaDewey()
    {
        return $this->belongsTo(SubcategoriaDewey::class, 'subcategoria_id');
    }
}