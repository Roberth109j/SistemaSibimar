<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property string $nombres
 * @property string $apellidos
 */
class Autor extends Model
{
    use HasFactory;

    protected $table = 'autores';
    
    public $timestamps = false;

    protected $fillable = [
        'apellidos',
        'nombres'
    ];

    protected $primaryKey = 'id';
    public $incrementing = true;
    protected $keyType = 'int';

    protected $casts = [
        'id' => 'integer',
    ];

    // Relación con libros
    public function libros(): HasMany
    {
        return $this->hasMany(Libro::class, 'autor_id');
    }

    // Método para obtener el nombre completo
    public function getNombreCompletoAttribute(): string
    {
        return "{$this->apellidos}, {$this->nombres}";
    }
}