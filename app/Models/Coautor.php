<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Coautor extends Model
{
    use HasFactory;

    protected $table = 'coautores';

    protected $fillable = [
        'libro_id',
        'nombre_completo'
    ];

    /**
     * Obtiene el libro al que pertenece el coautor.
     */
    public function libro()
    {
        return $this->belongsTo(Libro::class);
    }
}