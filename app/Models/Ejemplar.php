<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\Prestamo;

class Ejemplar extends Model
{
    use HasFactory;
    
    /**
     * La tabla asociada con el modelo.
     *
     * @var string
     */
    protected $table = 'ejemplares';
    
    /**
     * Los atributos que son asignables en masa.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'libro_id',
        'numEjemplar',
        'tipo_adquisicion',
        'estado',
        'observaciones'
    ];
    
    /**
     * Los atributos que deben ser convertidos.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'numEjemplar' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
    
    /**
     * Constantes para tipo_adquisicion
     */
    public const TIPO_COMPRA = 'COMPRA';
    public const TIPO_REPOSICION = 'REPOSICION';
    public const TIPO_DONACION = 'DONACION';
    
    /**
     * Constantes para estado - CORREGIDAS CON ESPACIOS
     */
    public const ESTADO_DISPONIBLE = 'DISPONIBLE';
    public const ESTADO_PRESTADO = 'PRESTADO';
    public const ESTADO_DADO_DE_BAJA = 'DADO DE BAJA';  // ✅ CON ESPACIOS
    public const ESTADO_PERDIDO = 'PERDIDO';
    
    /**
     * Retorna todos los valores posibles para tipo_adquisicion
     *
     * @return array<string>
     */
    public static function tiposAdquisicion(): array
    {
        return [
            self::TIPO_COMPRA,
            self::TIPO_DONACION,
            self::TIPO_REPOSICION,
        ];
    }
    
    /**
     * Retorna todos los valores posibles para estado
     *
     * @return array<string>
     */
    public static function estados(): array
    {
        return [
            self::ESTADO_DISPONIBLE,
            self::ESTADO_PRESTADO,
            self::ESTADO_DADO_DE_BAJA,
            self::ESTADO_PERDIDO,
        ];
    }
    
    /**
     * Relación con Libro
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function libro(): BelongsTo
    {
        return $this->belongsTo(Libro::class);
    }

    /**
     * Relación con Préstamos
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function prestamos(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Prestamo::class);
    }
    
    /**
     * Comprueba si el ejemplar está disponible
     *
     * @return bool
     */
    public function estaDisponible(): bool
    {
        return $this->estado === self::ESTADO_DISPONIBLE;
    }
    
    /**
     * Comprueba si el ejemplar está prestado
     *
     * @return bool
     */
    public function estaPrestado(): bool
    {
        return $this->estado === self::ESTADO_PRESTADO;
    }
    
    /**
     * Comprueba si el ejemplar está dado de baja
     *
     * @return bool
     */
    public function estaDadoDeBaja(): bool
    {
        return $this->estado === self::ESTADO_DADO_DE_BAJA;
    }
    
    /**
     * Comprueba si el ejemplar está perdido
     *
     * @return bool
     */
    public function estaPerdido(): bool
    {
        return $this->estado === self::ESTADO_PERDIDO;
    }
    
    /**
     * Comprueba si el ejemplar está inactivo
     *
     * @return bool
     */
    public function estaInactivo(): bool
    {
        return $this->estaDadoDeBaja() || $this->estaPerdido();
    }
    
    /**
     * Marca el ejemplar como prestado
     *
     * @return void
     */
    public function marcarComoPrestado(): void
    {
        $this->estado = self::ESTADO_PRESTADO;
        $this->save();
    }
    
    /**
     * Marca el ejemplar como disponible
     *
     * @return void
     */
    public function marcarComoDisponible(): void
    {
        $this->estado = self::ESTADO_DISPONIBLE;
        $this->save();
    }
    
    /**
     * Marca el ejemplar como dado de baja
     *
     * @return void
     */
    public function marcarComoDadoDeBaja(): void
    {
        $this->estado = self::ESTADO_DADO_DE_BAJA;
        $this->save();
    }
    
    /**
     * Marca el ejemplar como perdido
     * Si tiene un préstamo activo, lo marca como vencido
     *
     * @return void
     */
    public function marcarComoPerdido(): void
    {
        $this->estado = self::ESTADO_PERDIDO;
        $this->save();
        
        // Si tiene un préstamo activo, marcarlo como vencido
        $prestamoActivo = Prestamo::where('ejemplar_id', $this->id)
            ->where('estado', Prestamo::ESTADO_ACTIVO)
            ->first();
            
        if ($prestamoActivo) {
            $prestamoActivo->marcarComoVencido();
        }
    }
}