<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Lector extends Model
{
    use HasFactory;

    protected $table = 'lectores';

    protected $fillable = [
        'nombre',
        'codigo',
        'tipo',
        'grado_id',
        'estado'
    ];

    // Enums para tipo
    const TIPO_ESTUDIANTE = 'ESTUDIANTE';
    const TIPO_DOCENTE = 'DOCENTE';
    const TIPO_OTRO = 'OTRO';

    // Enums para estado
    const ESTADO_ACTIVO = 'ACTIVO';
    const ESTADO_INACTIVO = 'INACTIVO';

    // Relación con Grado (solo para estudiantes)
    public function grado(): BelongsTo
    {
        return $this->belongsTo(Grado::class);
    }

    // Relación con Prestamos
    public function prestamos(): HasMany
    {
        return $this->hasMany(Prestamo::class, 'usuario_id');
    }

    // Métodos de utilidad
    public function estaActivo(): bool
    {
        return $this->estado === self::ESTADO_ACTIVO;
    }

    public function esEstudiante(): bool
    {
        return $this->tipo === self::TIPO_ESTUDIANTE;
    }

    public function esDocente(): bool
    {
        return $this->tipo === self::TIPO_DOCENTE;
    }

    public function prestamosActivos()
    {
        return $this->prestamos()
            ->where('estado', Prestamo::ESTADO_ACTIVO);
    }

    public function prestamosVencidos()
    {
        return $this->prestamos()
            ->where('estado', Prestamo::ESTADO_VENCIDO);
    }

    public function tienePrestamosActivos(): bool
    {
        return $this->prestamosActivos()->exists();
    }

    public function tienePrestamosVencidos(): bool
    {
        return $this->prestamosVencidos()->exists();
    }
}