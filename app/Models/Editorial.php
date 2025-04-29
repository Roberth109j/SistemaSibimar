<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Editorial extends Model
{
    use HasFactory;

    /**
     * El nombre de la tabla asociada con el modelo.
     *
     * @var string
     */
    protected $table = 'editoriales';

    /**
     * Indica si se deben aplicar timestamps automáticamente.
     *
     * @var bool
     */
    public $timestamps = true;

    /**
     * Los atributos que son asignables en masa.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'nombre',
        'ciudad',
        'pais'
    ];

    /**
     * Obtiene los libros publicados por esta editorial.
     */
    public function libros(): HasMany
    {
        return $this->hasMany(Libro::class, 'editorial_id');
    }
}