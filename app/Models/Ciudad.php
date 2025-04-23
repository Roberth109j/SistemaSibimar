<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Ciudad extends Model
{
    use HasFactory;

    protected $table = 'ciudades';

    protected $fillable = [
        'nombre',
        'pais_id'
    ];

    /**
     * Obtiene el país al que pertenece la ciudad.
     */
    public function pais(): BelongsTo
    {
        return $this->belongsTo(Pais::class);
    }

    /**
     * Obtiene las editoriales ubicadas en esta ciudad.
     */
    public function editoriales(): HasMany
    {
        return $this->hasMany(Editorial::class);
    }
}