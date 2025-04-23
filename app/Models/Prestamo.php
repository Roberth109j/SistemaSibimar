<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Prestamo extends Model
{
    use HasFactory;

    protected $table = 'prestamos';

    protected $fillable = [
        'ejemplar_id',
        'usuario_id',
        'fecha_prestamo',
        'fecha_devolucion',
        'estado',
        'observaciones'
    ];

    // Enums para estado
    const ESTADO_ACTIVO = 'ACTIVO';
    const ESTADO_DEVUELTO = 'DEVUELTO';
    const ESTADO_VENCIDO = 'VENCIDO';

    // Relación con Ejemplar
    public function ejemplar(): BelongsTo
    {
        return $this->belongsTo(Ejemplar::class);
    }

    // Relación con Usuario
    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Métodos de utilidad
    public function estaActivo(): bool
    {
        return $this->estado === self::ESTADO_ACTIVO;
    }

    public function estaDevuelto(): bool
    {
        return $this->estado === self::ESTADO_DEVUELTO;
    }

    public function estaVencido(): bool
    {
        return $this->estado === self::ESTADO_VENCIDO;
    }

    public function marcarComoDevuelto(): void
    {
        $this->estado = self::ESTADO_DEVUELTO;
        $this->save();
        
        // Actualizar el estado del ejemplar
        $this->ejemplar->marcarComoDisponible();
    }

    public function marcarComoVencido(): void
    {
        $this->estado = self::ESTADO_VENCIDO;
        $this->save();
    }
}