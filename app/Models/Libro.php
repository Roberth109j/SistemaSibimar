<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Libro extends Model
{
    use HasFactory;

    protected $table = 'libros';

    protected $fillable = [
        'isbn',
        'titulo',
        'contenido',
        'seccion_id',
        'autor_id',
        'editorial_id',
        'clase',
        'tomo',
        'edicion',
        'anio',
        'fecha_ingreso',
        'precio',
        'idioma',
        'edad_recomendada',
        'paginas',
        'tema_id',
        'sign_top',
        'estanteria_id'
    ];

    protected $casts = [
        'fecha_ingreso' => 'date',
        'anio' => 'integer',
        'precio' => 'decimal:2',
        'paginas' => 'integer',
        'tomo' => 'integer'
    ];

    // Enums para las clases de libro
    const CLASE_LIBRO = 'LIBRO';
    const CLASE_CARTILLA = 'CARTILLA';
    const CLASE_CUENTO = 'CUENTO';
    const CLASE_DICCIONARIO = 'DICCIONARIO';
    const CLASE_ENCICLOPEDIA = 'ENCICLOPEDIA';
    const CLASE_NOVELA = 'NOVELA';
    const CLASE_REVISTA = 'REVISTA';

    // Enums para idiomas
    const IDIOMA_ESPANOL = 'ESPANOL';
    const IDIOMA_INGLES = 'INGLES';
    const IDIOMA_FRANCES = 'FRANCES';
    const IDIOMA_OTRO = 'OTRO';

    // Relaciones
    public function seccion(): BelongsTo
    {
        return $this->belongsTo(Seccion::class);
    }

    public function autor(): BelongsTo
    {
        return $this->belongsTo(Autor::class);
    }


    public function editorial(): BelongsTo
    {
        return $this->belongsTo(Editorial::class);
    }

    public function temaDewey(): BelongsTo
    {
        return $this->belongsTo(TemaDewey::class, 'tema_id');
    }

    public function grado(): BelongsTo
    {
        return $this->belongsTo(Grado::class);
    }

    public function estanteria(): BelongsTo
    {
        return $this->belongsTo(Estanteria::class);
    }

    public function ejemplares(): HasMany
    {
        return $this->hasMany(Ejemplar::class);
    }

    // Scopes
    public function scopeDisponibles($query)
    {
        // Implementar lógica para libros disponibles
        return $query;
    }

    public function scopePorSeccion($query, $seccionId)
    {
        return $query->where('seccion_id', $seccionId);
    }

    public function scopePorClase($query, $clase)
    {
        return $query->where('clase', $clase);
    }
}