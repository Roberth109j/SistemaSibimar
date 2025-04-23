<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Pais extends Model
{
    use HasFactory;

    protected $table = 'paises';

    protected $fillable = [
        'nombre',
    ];

    /**
     * Obtiene las ciudades que pertenecen a este país.
     */
    public function ciudades(): HasMany
    {
        return $this->hasMany(Ciudad::class);
    }
}