<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Autor extends Model
{
    use HasFactory;

    protected $table = 'autores';

    public $timestamps = false;

    protected $fillable = [
        'apellidos',
        'nombres'
    ];

    // Relación con libros: un autor puede tener muchos libros
    public function libros(): HasMany
    {
        return $this->hasMany(Libro::class);
    }

    // Método para obtener el nombre completo del autor
    public function getNombreCompletoAttribute(): string
    {
        return "{$this->apellidos}, {$this->nombres}";
    }
}