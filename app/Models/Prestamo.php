<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Prestamo extends Model
{
    use HasFactory;
    public $timestamps = false;

    protected $table = 'prestamos';
    
    protected $fillable = [
        'ejemplar_id',
        'lector_id',
        'fecha_prestamo',
        'fecha_devolucion',
        'fecha_devuelto',
        'estado',
    ];

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($prestamo) {
            // Validar datos antes de crear el préstamo
            self::validatePrestamoData($prestamo->toArray());
            
            // Validar que el lector existe y está activo
            if ($prestamo->lector_id) {
                $lector = Lector::find($prestamo->lector_id);
                if (!$lector) {
                    throw new \Exception('El lector no existe');
                }
                if (!$lector->estaActivo()) {
                    throw new \Exception('El lector no está activo');
                }
            }
            
            // Marcar el ejemplar como prestado cuando se crea el préstamo
            if ($prestamo->ejemplar_id) {
                $ejemplar = Ejemplar::find($prestamo->ejemplar_id);
                if (!$ejemplar) {
                    throw new \Exception('El ejemplar no existe');
                }
                if (!$ejemplar->estaDisponible()) {
                    throw new \Exception('El ejemplar no está disponible para préstamo');
                }
                $ejemplar->marcarComoPrestado();
            }
        });
    }

    /**
     * Validar datos del préstamo antes de crear
     */
    public static function validatePrestamoData(array $data)
    {
        // Verificar campos requeridos
        $requiredFields = ['ejemplar_id', 'lector_id', 'fecha_prestamo', 'fecha_devolucion'];
        
        foreach ($requiredFields as $field) {
            if (empty($data[$field])) {
                throw new \Exception('Los campos son requeridos');
            }
        }
    }

    // Enums para estado
    const ESTADO_ACTIVO = 'ACTIVO';
    const ESTADO_DEVUELTO = 'DEVUELTO';
    const ESTADO_VENCIDO = 'VENCIDO';

    // Relación con Ejemplar
    public function ejemplar(): BelongsTo
    {
        return $this->belongsTo(Ejemplar::class);
    }

    // Relación con Lector
    public function lector(): BelongsTo
    {
        return $this->belongsTo(Lector::class);
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
        if ($this->estaDevuelto()) {
            throw new \Exception('Este préstamo ya ha sido devuelto');
        }
        
        $this->estado = self::ESTADO_DEVUELTO;
        $this->fecha_devuelto = now()->format('Y-m-d');
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