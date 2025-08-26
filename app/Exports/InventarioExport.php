<?php

namespace App\Exports;

use App\Models\Estanteria;
use App\Models\Libro;
use App\Models\Ejemplar;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithColumnFormatting;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;
use Illuminate\Support\Facades\DB;

class InventarioExport implements FromCollection, WithHeadings, WithStyles, WithMapping, ShouldAutoSize, WithColumnFormatting
{
    protected $filters;

    public function __construct($filters = [])
    {
        $this->filters = $filters;
    }

    /**
     * Obtiene la colección de libros para exportar
     */
    public function collection()
    {
        // ✅ CONSULTA ACTUALIZADA CON ESTADOS SEPARADOS
        $query = Libro::with(['ejemplares', 'autor', 'editorial', 'seccion'])
            ->withCount([
                'ejemplares',
                'ejemplares as ejemplares_disponibles_count' => function ($query) {
                    $query->where('estado', Ejemplar::ESTADO_DISPONIBLE);
                },
                'ejemplares as ejemplares_prestados_count' => function ($query) {
                    $query->where('estado', Ejemplar::ESTADO_PRESTADO);
                },
                // ✅ SEPARAR DADOS DE BAJA Y PERDIDOS
                'ejemplares as ejemplares_dados_baja_count' => function ($query) {
                    $query->where('estado', Ejemplar::ESTADO_DADO_DE_BAJA);
                },
                'ejemplares as ejemplares_perdidos_count' => function ($query) {
                    $query->where('estado', Ejemplar::ESTADO_PERDIDO);
                }
            ]);

        // ✅ FILTROS ACTUALIZADOS
        if (!empty($this->filters['search'])) {
            $search = $this->filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('titulo', 'like', "%{$search}%")
                  ->orWhere('isbn', 'like', "%{$search}%")
                  ->orWhereHas('autor', function ($q) use ($search) {
                      $q->where(DB::raw("CONCAT(nombres, ' ', apellidos)"), 'like', "%{$search}%");
                  });
            });
        }

        if (!empty($this->filters['clase'])) {
            $query->where('clase', $this->filters['clase']);
        }

        if (!empty($this->filters['idioma'])) {
            $query->where('idioma', $this->filters['idioma']);
        }

        // ✅ FILTROS DE ESTADO ACTUALIZADOS
        if (!empty($this->filters['estado'])) {
            switch ($this->filters['estado']) {
                case 'disponibles':
                    $query->whereHas('ejemplares', function ($q) {
                        $q->where('estado', Ejemplar::ESTADO_DISPONIBLE);
                    });
                    break;
                case 'prestados':
                    $query->whereHas('ejemplares', function ($q) {
                        $q->where('estado', Ejemplar::ESTADO_PRESTADO);
                    });
                    break;
                case 'dados_baja':
                    $query->whereHas('ejemplares', function ($q) {
                        $q->where('estado', Ejemplar::ESTADO_DADO_DE_BAJA);
                    });
                    break;
                case 'perdidos':
                    $query->whereHas('ejemplares', function ($q) {
                        $q->where('estado', Ejemplar::ESTADO_PERDIDO);
                    });
                    break;
                case 'en_circulacion':
                    $query->whereHas('ejemplares', function ($q) {
                        $q->whereIn('estado', [Ejemplar::ESTADO_DISPONIBLE, Ejemplar::ESTADO_PRESTADO]);
                    });
                    break;
            }
        }

        return $query->orderBy('titulo')->get();
    }

    /**
     * Mapea los datos de cada libro para el Excel - ACTUALIZADO
     */
    public function map($libro): array
    {
        // ✅ CALCULAR TOTAL ACTIVOS (solo disponibles + prestados)
        $totalActivos = $libro->ejemplares_disponibles_count + $libro->ejemplares_prestados_count;

        return [
            $libro->created_at ? $libro->created_at->format('d/m/Y') : 'N/A',
            $libro->titulo,            
            $libro->isbn ?? 'N/A',
            $libro->autor ? ($libro->autor->nombres . ' ' . $libro->autor->apellidos) : 'Sin autor',
            $libro->editorial ? $libro->editorial->nombre : 'Sin editorial',
            $libro->clase ?? 'N/A',
            $libro->seccion ? $libro->seccion->nombre : 'Sin sección',
            $libro->ejemplares_disponibles_count,
            $libro->ejemplares_prestados_count,
            $libro->ejemplares_dados_baja_count, 
            $libro->ejemplares_perdidos_count,   
            $totalActivos,                       
        ];
    }

    /**
     * Define los encabezados de las columnas - ACTUALIZADO
     */
    public function headings(): array
    {
        return [
            'Fecha Registro',
            'Título',
            'ISBN',
            'Autor',
            'Editorial',
            'Clase',
            'Sección',
            'Disponibles',
            'Prestados',
            'Dados de Baja',      // ✅ NUEVO
            'Perdidos',           // ✅ NUEVO
            'Total Activos',      // ✅ SOLO disponibles + prestados
        ];
    }

    /**
     * Define el formato de las columnas - ACTUALIZADO
     */
    public function columnFormats(): array
    {
        return [
            'B' => NumberFormat::FORMAT_TEXT, // ISBN como texto
        ];
    }

    /**
     * Aplica estilos al Excel - ACTUALIZADO
     */
    public function styles(Worksheet $sheet)
    {
        return [
            // Estilo para la fila de encabezados
            1 => [
                'font' => [
                    'bold' => true,
                    'color' => ['rgb' => 'FFFFFF'],
                    'size' => 12,
                ],
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['rgb' => '4472C4'],
                ],
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_CENTER,
                    'vertical' => Alignment::VERTICAL_CENTER,
                ],
            ],
            // Estilo para todas las celdas
            'A:M' => [
                'alignment' => [
                    'vertical' => Alignment::VERTICAL_CENTER,
                ],
            ],
            // Estilo para las columnas numéricas
            'G:L' => [ // Disponibles, Prestados, Dados de Baja, Perdidos, Total Activos, Total Ejemplares
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_CENTER,
                ],
                'font' => [
                    'bold' => true,
                ],
            ],
        ];
    }
}