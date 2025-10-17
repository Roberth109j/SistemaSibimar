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
        'codigo_unico',
        'titulo',
        'contenido',
        'seccion_id',
        'autor_id',
        'editorial_id',
        'area',
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

    // ✅ FIX: Cambiar 'date' a 'date:Y-m-d' para evitar problemas de timezone
    protected $casts = [
        'fecha_ingreso' => 'date:Y-m-d',  // Formato fijo sin timezone
        'anio' => 'integer',
        'precio' => 'decimal:2',
        'paginas' => 'integer',
        'tomo' => 'integer'
    ];

    // Enums para las clases de material (solo LIBRO y REVISTA)
    const CLASE_LIBRO = 'LIBRO';
    const CLASE_REVISTA = 'REVISTA';

    // Enums para las áreas
    const AREA_CIENCIAS = 'CIENCIAS';
    const AREA_MATEMATICAS = 'MATEMATICAS';
    const AREA_HUMANIDADES = 'HUMANIDADES';
    const AREA_IDIOMAS = 'IDIOMAS';
    const AREA_TECNOLOGIA = 'TECNOLOGIA';
    const AREA_OTRAS = 'OTRAS';

    // Enums para idiomas
    const IDIOMA_ESPANOL = 'ESPAÑOL';
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

    public function scopePorArea($query, $area)
    {
        return $query->where('area', $area);
    }

    public function scopeSearchByContent($query, $searchTerm)
    {
        return $query->whereRaw(
            "MATCH(titulo, contenido) AGAINST(? IN NATURAL LANGUAGE MODE)",
            [$searchTerm]
        );
    }

    // Métodos auxiliares para validación de códigos
    public static function getCodigoValidationRule($clase)
    {
        if ($clase === self::CLASE_LIBRO) {
            return 'regex:/^\d{13}$/';
        } elseif ($clase === self::CLASE_REVISTA) {
            return 'regex:/^\d{8}$/';
        }
        return 'required|string';
    }

    public static function getCodigoPlaceholder($clase)
    {
        if ($clase === self::CLASE_LIBRO) {
            return 'Ej: 9780123456789 (13 dígitos)';
        } elseif ($clase === self::CLASE_REVISTA) {
            return 'Ej: 12345678 (8 dígitos)';
        }
        return 'Código único';
    }

    public static function getCodigoLabel($clase)
    {
        if ($clase === self::CLASE_LIBRO) {
            return 'ISBN';
        } elseif ($clase === self::CLASE_REVISTA) {
            return 'ISSN';
        }
        return 'Código Único';
    }

    // Accessor para mantener compatibilidad con código existente que use 'isbn'
    public function getIsbnAttribute()
    {
        return $this->codigo_unico;
    }

    // Mutator para mantener compatibilidad
    public function setIsbnAttribute($value)
    {
        $this->attributes['codigo_unico'] = $value;
    }
}