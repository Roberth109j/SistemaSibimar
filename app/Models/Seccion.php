<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Seccion extends Model
{
    use HasFactory;
    protected $table = 'secciones';


    protected $fillable = [
        'nombre'
    ];

    protected $casts = [
        'nombre' => 'string'
    ];

    /**
     * Obtiene los grados que pertenecen a esta sección
     */
    public function grados(): HasMany
    {
        return $this->hasMany(Grado::class);
    }

    /**
     * Verifica si la sección es primaria
     */
    public function esPrimaria(): bool
    {
        return $this->nombre === 'PRIMARIA';
    }

    /**
     * Verifica si la sección es bachillerato
     */
    public function esBachillerato(): bool
    {
        return $this->nombre === 'BACHILLERATO';
    }
}