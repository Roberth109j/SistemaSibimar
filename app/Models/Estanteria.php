<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Estanteria extends Model
{
    use HasFactory;

    protected $table = 'estanterias';

    protected $fillable = [
        'cod_estante',
        'descripcion'
    ];

    // Relación con libros: una estantería puede tener muchos libros
    public function libros(): HasMany
    {
        return $this->hasMany(Libro::class);
    }
}