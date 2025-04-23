<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Ejemplar extends Model
{
    use HasFactory;

    protected $table = 'ejemplares';

    protected $fillable = [
        'libro_id',
        'cantidad',
        'tipo_adquisicion',
        'estado',
        'observaciones'
    ];

    // Enums para tipo_adquisicion
    const TIPO_COMPRA = 'COMPRA';
    const TIPO_REPOSICION = 'REPOSICION';
    const TIPO_DONACION = 'DONACION';

    // Enums para estado
    const ESTADO_DISPONIBLE = 'DISPONIBLE';
    const ESTADO_PRESTADO = 'PRESTADO';
    const ESTADO_INACTIVO = 'INACTIVO';

    // Relación con Libro
    public function libro(): BelongsTo
    {
        return $this->belongsTo(Libro::class);
    }

    // Métodos de utilidad
    public function estaDisponible(): bool
    {
        return $this->estado === self::ESTADO_DISPONIBLE;
    }

    public function estaPrestado(): bool
    {
        return $this->estado === self::ESTADO_PRESTADO;
    }

    public function estaInactivo(): bool
    {
        return $this->estado === self::ESTADO_INACTIVO;
    }

    public function marcarComoPrestado(): void
    {
        $this->estado = self::ESTADO_PRESTADO;
        $this->save();
    }

    public function marcarComoDisponible(): void
    {
        $this->estado = self::ESTADO_DISPONIBLE;
        $this->save();
    }

    public function marcarComoInactivo(): void
    {
        $this->estado = self::ESTADO_INACTIVO;
        $this->save();
    }
}