<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

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
    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($libro) {
            // Validar datos antes de crear el libro
            self::validateLibroData($libro->toArray());
        });
        
        static::created(function ($libro) {
            // Crear automáticamente un ejemplar cuando se crea un libro
            Ejemplar::create([
                'libro_id' => $libro->id,
                'numEjemplar' => 1,
                'tipo_adquisicion' => Ejemplar::TIPO_COMPRA,
                'estado' => Ejemplar::ESTADO_DISPONIBLE,
                'observaciones' => 'Ejemplar creado automáticamente al registrar el libro'
            ]);
        });
    }

    /**
     * Validar datos del libro antes de crear
     */
    public static function validateLibroData(array $data)
    {
        // Verificar si el código único ya existe (antes de verificar campos requeridos)
        if (isset($data['codigo_unico']) && !empty($data['codigo_unico'])) {
            $existingLibro = self::where('codigo_unico', $data['codigo_unico'])->first();
            if ($existingLibro) {
                throw new \Exception('El código único ya está registrado');
            }
        }
        
        // Verificar formato del ISBN (código único) - antes de verificar campos requeridos
        if (isset($data['codigo_unico']) && !empty($data['codigo_unico'])) {
            $codigo = $data['codigo_unico'];
            // Verificar que no contenga caracteres no válidos para ISBN
            if (preg_match('/[^0-9\-]/', $codigo)) {
                throw new \Exception('El formato del ISBN es incorrecto');
            }
            // Verificar longitud del ISBN (debe tener al menos 10 caracteres)
            if (strlen($codigo) < 10) {
                throw new \Exception('El formato del ISBN es incorrecto');
            }
        }
        
        // Verificar campos requeridos (solo si no hay errores específicos)
        $requiredFields = ['codigo_unico', 'titulo', 'seccion_id', 'autor_id', 'editorial_id', 'clase', 'idioma', 'tema_id', 'estanteria_id', 'fecha_ingreso'];
        
        foreach ($requiredFields as $field) {
            if (empty($data[$field])) {
                throw new \Exception('Registro no realizado por la falta de campos');
            }
        }
    }

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