<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Grado extends Model
{
    use HasFactory;
    // Desactivar timestamps
    public $timestamps = false;
    
    /**
     * Obtiene la sección a la que pertenece el grado
     */
    public function seccion(): BelongsTo
    {
        return $this->belongsTo(Seccion::class);
    }
    
    protected $fillable = [
        'grado',
        'subGrado',
        'estado',
        'seccion_id'
    ];

    protected $casts = [
        'estado' => 'string',
        'grado' => 'string'
    ];

    /**
     * Verifica si el grado está activo
     */
    public function estaActivo(): bool
    {
        return $this->estado === 'ACTIVO';
    }
}