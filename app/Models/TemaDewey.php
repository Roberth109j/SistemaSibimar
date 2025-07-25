<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class TemaDewey extends Model
{
    use HasFactory;
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
    public function subcategoria()
    {
        return $this->belongsTo(SubcategoriaDewey::class, 'subcategoria_id');
    }
}