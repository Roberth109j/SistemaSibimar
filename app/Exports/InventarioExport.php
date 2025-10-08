<?php

namespace App\Exports;

use App\Models\Ejemplar;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithColumnFormatting;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithChunkReading;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;
use Illuminate\Support\Facades\DB;

class InventarioExport implements WithMultipleSheets
{
    protected $filters;

    public function __construct($filters = [])
    {
        $this->filters = $filters;
    }

    public function sheets(): array
    {
        // Obtener áreas de forma optimizada
        $areas = $this->obtenerAreasDisponibles();
        $sheets = [];
        
        foreach ($areas as $area) {
            $sheets[] = new AreaSheetOptimized($area, $this->filters);
        }
        
        $sheets[] = new ResumenSheetOptimized($this->filters);
        
        return $sheets;
    }

    private function obtenerAreasDisponibles()
    {
        $query = DB::table('libros')
            ->select('area')
            ->whereNotNull('area')
            ->distinct();
            
        $this->aplicarFiltrosBase($query);
        
        return $query->pluck('area')->toArray();
    }

    private function aplicarFiltrosBase($query)
    {
        if (!empty($this->filters['seccion_id'])) {
            $query->where('seccion_id', $this->filters['seccion_id']);
        }

        if (!empty($this->filters['clase'])) {
            $query->where('clase', $this->filters['clase']);
        }

        if (!empty($this->filters['search'])) {
            $search = $this->filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('titulo', 'like', "%{$search}%")
                  ->orWhere('codigo_unico', 'like', "%{$search}%")
                  ->orWhere('contenido', 'like', "%{$search}%");
            });
        }
    }
}

/**
 * Hoja optimizada para manejar miles de registros
 */
class AreaSheetOptimized implements FromQuery, WithHeadings, WithStyles, WithMapping, ShouldAutoSize, WithColumnFormatting, WithTitle, WithChunkReading
{
    protected $area;
    protected $filters;

    public function __construct($area, $filters = [])
    {
        $this->area = $area;
        $this->filters = $filters;
    }

    public function title(): string
    {
        return substr($this->area, 0, 31);
    }

    public function chunkSize(): int
    {
        return 1000; // Procesar en lotes de 1000 registros
    }

    /**
     * Query optimizada con JOINs en lugar de relaciones Eloquent
     */
    public function query()
    {
        return DB::table('libros')
            ->leftJoin('autores', 'libros.autor_id', '=', 'autores.id')
            ->leftJoin('editoriales', 'libros.editorial_id', '=', 'editoriales.id')
            ->leftJoin('secciones', 'libros.seccion_id', '=', 'secciones.id')
            ->leftJoin('estanterias', 'libros.estanteria_id', '=', 'estanterias.id')
            ->select([
                'libros.fecha_ingreso', // ✅ CAMBIO: ahora usa fecha_ingreso
                'libros.titulo',
                'libros.codigo_unico',
                'libros.clase',
                'libros.area',
                DB::raw("CONCAT(COALESCE(autores.nombres, ''), ' ', COALESCE(autores.apellidos, '')) as autor_completo"),
                'editoriales.nombre as editorial_nombre',
                'secciones.nombre as seccion_nombre',
                'estanterias.cod_estante',
                'libros.sign_top', // ✅ CAMBIO: ahora usa sign_top en lugar de codigo dewey
                // Subconsultas optimizadas para conteos
                DB::raw('(SELECT COUNT(*) FROM ejemplares WHERE ejemplares.libro_id = libros.id AND ejemplares.estado = "' . Ejemplar::ESTADO_DISPONIBLE . '") as disponibles'),
                DB::raw('(SELECT COUNT(*) FROM ejemplares WHERE ejemplares.libro_id = libros.id AND ejemplares.estado = "' . Ejemplar::ESTADO_PRESTADO . '") as prestados'),
                DB::raw('(SELECT COUNT(*) FROM ejemplares WHERE ejemplares.libro_id = libros.id AND ejemplares.estado = "' . Ejemplar::ESTADO_DADO_DE_BAJA . '") as dados_baja'),
                DB::raw('(SELECT COUNT(*) FROM ejemplares WHERE ejemplares.libro_id = libros.id AND ejemplares.estado = "' . Ejemplar::ESTADO_PERDIDO . '") as perdidos')
            ])
            ->where('libros.area', $this->area)
            ->when(!empty($this->filters['seccion_id']), function ($query) {
                return $query->where('libros.seccion_id', $this->filters['seccion_id']);
            })
            ->when(!empty($this->filters['clase']), function ($query) {
                return $query->where('libros.clase', $this->filters['clase']);
            })
            ->when(!empty($this->filters['search']), function ($query) {
                $search = $this->filters['search'];
                return $query->where(function ($q) use ($search) {
                    $q->where('libros.titulo', 'like', "%{$search}%")
                      ->orWhere('libros.codigo_unico', 'like', "%{$search}%")
                      ->orWhere('libros.contenido', 'like', "%{$search}%")
                      ->orWhere(DB::raw("CONCAT(COALESCE(autores.nombres, ''), ' ', COALESCE(autores.apellidos, ''))"), 'like', "%{$search}%");
                });
            })
            ->when(!empty($this->filters['estado']), function ($query) {
                switch ($this->filters['estado']) {
                    case 'disponibles':
                        return $query->whereExists(function ($q) {
                            $q->select(DB::raw(1))
                              ->from('ejemplares')
                              ->whereColumn('ejemplares.libro_id', 'libros.id')
                              ->where('ejemplares.estado', Ejemplar::ESTADO_DISPONIBLE);
                        });
                    case 'prestados':
                        return $query->whereExists(function ($q) {
                            $q->select(DB::raw(1))
                              ->from('ejemplares')
                              ->whereColumn('ejemplares.libro_id', 'libros.id')
                              ->where('ejemplares.estado', Ejemplar::ESTADO_PRESTADO);
                        });
                    case 'dados_baja':
                        return $query->whereExists(function ($q) {
                            $q->select(DB::raw(1))
                              ->from('ejemplares')
                              ->whereColumn('ejemplares.libro_id', 'libros.id')
                              ->where('ejemplares.estado', Ejemplar::ESTADO_DADO_DE_BAJA);
                        });
                    case 'perdidos':
                        return $query->whereExists(function ($q) {
                            $q->select(DB::raw(1))
                              ->from('ejemplares')
                              ->whereColumn('ejemplares.libro_id', 'libros.id')
                              ->where('ejemplares.estado', Ejemplar::ESTADO_PERDIDO);
                        });
                    case 'en_circulacion':
                        return $query->whereExists(function ($q) {
                            $q->select(DB::raw(1))
                              ->from('ejemplares')
                              ->whereColumn('ejemplares.libro_id', 'libros.id')
                              ->whereIn('ejemplares.estado', [Ejemplar::ESTADO_DISPONIBLE, Ejemplar::ESTADO_PRESTADO]);
                        });
                }
                return $query;
            })
            ->orderBy('libros.titulo');
    }

    public function map($row): array
    {
        $totalActivos = ($row->disponibles ?? 0) + ($row->prestados ?? 0);

        return [
            $row->fecha_ingreso ? date('d/m/Y', strtotime($row->fecha_ingreso)) : 'N/A', // ✅ CAMBIO
            $row->titulo ?? 'N/A',
            $row->codigo_unico ?? 'N/A',
            trim($row->autor_completo) ?: 'Sin autor',
            $row->editorial_nombre ?? 'Sin editorial',
            $row->clase ?? 'N/A',
            $row->area ?? 'N/A',
            $row->sign_top ?? 'N/A', // ✅ CAMBIO: ahora usa sign_top
            $row->seccion_nombre ?? 'Sin sección',
            $row->cod_estante ?? 'N/A',
            $row->disponibles ?? 0,
            $row->prestados ?? 0,
            $row->dados_baja ?? 0,
            $row->perdidos ?? 0,
            $totalActivos,
        ];
    }

    public function headings(): array
    {
        return [
            'Fecha Ingreso', // ✅ CAMBIO: nombre más descriptivo
            'Título',
            'Código Único',
            'Autor',
            'Editorial',
            'Clase',
            'Área',
            'Signatura Topográfica', // ✅ CAMBIO: nuevo nombre
            'Sección',
            'Estantería',
            'Disponibles',
            'Prestados',
            'Dados de Baja',
            'Perdidos',
            'Total Activos',
        ];
    }

    public function columnFormats(): array
    {
        return [
            'C' => NumberFormat::FORMAT_TEXT,
            'H' => NumberFormat::FORMAT_TEXT, // Signatura Topográfica como texto
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
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
            'A:O' => [
                'alignment' => [
                    'vertical' => Alignment::VERTICAL_CENTER,
                ],
            ],
            'H:H' => [
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_CENTER,
                ],
            ],
            'K:O' => [
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

/**
 * Hoja de resumen optimizada
 */
class ResumenSheetOptimized implements FromQuery, WithHeadings, WithStyles, WithMapping, ShouldAutoSize, WithTitle
{
    protected $filters;

    public function __construct($filters = [])
    {
        $this->filters = $filters;
    }

    public function title(): string
    {
        return 'RESUMEN GENERAL';
    }

    public function query()
    {
        return DB::table('libros')
            ->select([
                'area',
                DB::raw('COUNT(*) as total_libros'),
                DB::raw('SUM((SELECT COUNT(*) FROM ejemplares WHERE ejemplares.libro_id = libros.id)) as total_ejemplares'),
                DB::raw('SUM((SELECT COUNT(*) FROM ejemplares WHERE ejemplares.libro_id = libros.id AND ejemplares.estado = "' . Ejemplar::ESTADO_DISPONIBLE . '")) as disponibles'),
                DB::raw('SUM((SELECT COUNT(*) FROM ejemplares WHERE ejemplares.libro_id = libros.id AND ejemplares.estado = "' . Ejemplar::ESTADO_PRESTADO . '")) as prestados'),
                DB::raw('SUM((SELECT COUNT(*) FROM ejemplares WHERE ejemplares.libro_id = libros.id AND ejemplares.estado = "' . Ejemplar::ESTADO_DADO_DE_BAJA . '")) as dados_baja'),
                DB::raw('SUM((SELECT COUNT(*) FROM ejemplares WHERE ejemplares.libro_id = libros.id AND ejemplares.estado = "' . Ejemplar::ESTADO_PERDIDO . '")) as perdidos')
            ])
            ->whereNotNull('area')
            ->when(!empty($this->filters['seccion_id']), function ($query) {
                return $query->where('seccion_id', $this->filters['seccion_id']);
            })
            ->groupBy('area')
            ->orderBy('area');
    }

    public function map($row): array
    {
        $totalActivos = ($row->disponibles ?? 0) + ($row->prestados ?? 0);
        
        return [
            $row->area,
            $row->total_libros ?? 0,
            $row->total_ejemplares ?? 0,
            $row->disponibles ?? 0,
            $row->prestados ?? 0,
            $row->dados_baja ?? 0,
            $row->perdidos ?? 0,
            $totalActivos,
        ];
    }

    public function headings(): array
    {
        return [
            'Área',
            'Total Libros',
            'Total Ejemplares',
            'Disponibles',
            'Prestados',
            'Dados de Baja',
            'Perdidos',
            'Total Activos',
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => [
                'font' => [
                    'bold' => true,
                    'color' => ['rgb' => 'FFFFFF'],
                    'size' => 12,
                ],
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['rgb' => '28A745'],
                ],
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_CENTER,
                    'vertical' => Alignment::VERTICAL_CENTER,
                ],
            ],
            'A:H' => [
                'alignment' => [
                    'vertical' => Alignment::VERTICAL_CENTER,
                ],
            ],
            'B:H' => [
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