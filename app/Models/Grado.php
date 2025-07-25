<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Grado extends Model
{
    use HasFactory;
    // Desactivar timestamps
    /**
     * La tabla asociada al modelo.
     */
    protected $table = 'grados';

    /**
     * La clave primaria de la tabla.
     */
    protected $primaryKey = 'id';

    /**
     * Indica si la clave primaria es auto-incremental.
     */
    public $incrementing = true;

    /**
     * El tipo de datos de la clave primaria.
     */
    protected $keyType = 'int';

    /**
     * Habilitar timestamps (ya que tienes created_at y updated_at en la migración)
     */
    public $timestamps = true;

    /**
     * Los atributos que son asignables en masa.
     */
    protected $fillable = [
        'grado',
        'subGrado',
        'estado',
        'seccion_id'
    ];

    /**
     * Los atributos que deben ser convertidos a tipos nativos.
     */
    protected $casts = [
        'id' => 'integer',
        'seccion_id' => 'integer',
        'estado' => 'string',
        'grado' => 'string',
        'subGrado' => 'string',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Los valores por defecto para los atributos.
     */
    protected $attributes = [
        'estado' => 'ACTIVO',
    ];

    /**
     * Obtiene la sección a la que pertenece el grado
     */
    public function seccion(): BelongsTo
    {
        return $this->belongsTo(Seccion::class, 'seccion_id', 'id');
    }

    /**
     * Verifica si el grado está activo
     */
    public function estaActivo(): bool
    {
        return $this->estado === 'ACTIVO';
    }

    /**
     * Scope para filtrar por estado activo.
     */
    public function scopeActivo($query)
    {
        return $query->where('estado', 'ACTIVO');
    }

    /**
     * Scope para filtrar por estado inactivo.
     */
    public function scopeInactivo($query)
    {
        return $query->where('estado', 'INACTIVO');
    }

    /**
     * Accessor para obtener el nombre completo del grado.
     */
    public function getNombreCompletoAttribute(): string
    {
        if ($this->subGrado) {
            return $this->grado . ' ' . $this->subGrado;
        }
        return $this->grado;
    }
}
