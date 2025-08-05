<?php

namespace App\Exports;

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
        // Consulta base similar a la del controlador (SIN estanteria)
        $query = Libro::with(['ejemplares', 'autor', 'editorial', 'seccion'])
            ->withCount([
                'ejemplares',
                'ejemplares as ejemplares_disponibles_count' => function ($query) {
                    $query->where('estado', Ejemplar::ESTADO_DISPONIBLE);
                },
                'ejemplares as ejemplares_prestados_count' => function ($query) {
                    $query->where('estado', Ejemplar::ESTADO_PRESTADO);
                },
                'ejemplares as ejemplares_inactivos_count' => function ($query) {
                    $query->whereIn('estado', [Ejemplar::ESTADO_DAR_DE_BAJA, Ejemplar::ESTADO_PERDIDO]);
                }
            ]);

        // Aplicar los mismos filtros del controlador
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

        if (!empty($this->filters['estado'])) {
            if ($this->filters['estado'] === 'disponibles') {
                $query->whereHas('ejemplares', function ($q) {
                    $q->where('estado', Ejemplar::ESTADO_DISPONIBLE);
                });
            } elseif ($this->filters['estado'] === 'prestados') {
                $query->whereHas('ejemplares', function ($q) {
                    $q->where('estado', Ejemplar::ESTADO_PRESTADO);
                });
            } elseif ($this->filters['estado'] === 'inactivos') {
                $query->whereHas('ejemplares', function ($q) {
                    $q->where('estado', Ejemplar::ESTADO_INACTIVO);
                });
            }
        }

        return $query->orderBy('titulo')->get();
    }

    /**
     * Mapea los datos de cada libro para el Excel
     */
    public function map($libro): array
    {
        return [
            $libro->titulo,
            $libro->isbn ?? 'N/A',
            $libro->autor ? ($libro->autor->nombres . ' ' . $libro->autor->apellidos) : 'Sin autor',
            $libro->editorial ? $libro->editorial->nombre : 'Sin editorial',
            $libro->clase ?? 'N/A',
            $libro->seccion ? $libro->seccion->nombre : 'Sin sección',
            $libro->ejemplares_disponibles_count,
            $libro->ejemplares_prestados_count,
            $libro->ejemplares_inactivos_count,
            $libro->ejemplares_count,
            $libro->created_at ? $libro->created_at->format('d/m/Y') : 'N/A',
        ];
    }

    /**
     * Define los encabezados de las columnas
     */
    public function headings(): array
    {
        return [
            'Título',
            'ISBN',
            'Autor',
            'Editorial',
            'Clase',
            'Sección',
            'Disponibles',
            'Prestados',
            'Inactivos',
            'Total Ejemplares',
            'Fecha Registro',
        ];
    }

    /**
     * Define el formato de las columnas
     */
    public function columnFormats(): array
    {
        return [
            'B' => NumberFormat::FORMAT_TEXT,
        ];
    }

    /**
     * Aplica estilos al Excel
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
            'A:K' => [
                'alignment' => [
                    'vertical' => Alignment::VERTICAL_CENTER,
                ],
            ],
            // Estilo para las columnas numéricas
            'G:J' => [
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_CENTER,
                ],
            ],
        ];
    }
}