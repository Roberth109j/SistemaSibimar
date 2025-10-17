<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Estanteria extends Model
{
    use HasFactory;

    protected $table = 'estanterias';
    public $timestamps = false;

    protected $fillable = [
        'cod_estante',
        'descripcion',
        'seccion_id'
    ];

    // Relación con libros: una estantería puede tener muchos libros
    public function libros(): HasMany
    {
        return $this->hasMany(Libro::class);
    }

    // Relación con sección: una estantería pertenece a una sección
    public function seccion(): BelongsTo
    {
        return $this->belongsTo(Seccion::class);
    }

    // Scope para filtrar por sección
    public function scopePorSeccion($query, $seccionId)
    {
        return $query->where('seccion_id', $seccionId);
    }
}