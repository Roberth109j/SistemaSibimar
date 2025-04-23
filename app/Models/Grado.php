<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Grado extends Model
{
    /**
     * Obtiene la sección a la que pertenece el grado
     */
    public function seccion(): BelongsTo
    {
        return $this->belongsTo(Seccion::class);
    }
    protected $fillable = [
        'nombre',
        'estado',
        'seccion_id'
    ];

    protected $casts = [
        'estado' => 'string'
    ];

    /**
     * Verifica si el grado está activo
     */
    public function estaActivo(): bool
    {
        return $this->estado === 'ACTIVO';
    }
}