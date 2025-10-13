<?php

namespace App\Exports;

use App\Models\Ejemplar;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithChunkReading;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;
use PhpOffice\PhpSpreadsheet\Cell\DataType;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class InventarioExport implements WithMultipleSheets
{
    protected $filters;

    public function __construct($filters = [])
    {
        $this->filters = $filters;
    }

    public function sheets(): array
    {
        $startTime = microtime(true);
        
        Log::info('📊 Iniciando generación de Excel', [
            'filtros' => $this->filters,
            'timestamp' => now(),
            'memoria_inicial_mb' => round(memory_get_usage(true) / 1024 / 1024, 2)
        ]);
        
        $areas = $this->obtenerAreasDisponibles();
        $sheets = [];
        
        Log::info('📋 Áreas encontradas', [
            'total_areas' => count($areas), 
            'areas' => $areas
        ]);
        
        $totalesPorArea = $this->preCalcularTotales();
        
        foreach ($areas as $area) {
            $totalArea = $totalesPorArea[$area] ?? 0;
            Log::info("📄 Creando hoja para área: {$area}", ['registros_estimados' => $totalArea]);
            
            $sheets[] = new AreaSheet($area, $this->filters);
        }
        
        $sheets[] = new ResumenSheet($this->filters);
        
        $elapsed = round(microtime(true) - $startTime, 2);
        $memoriaActual = round(memory_get_usage(true) / 1024 / 1024, 2);
        
        Log::info('✅ Hojas creadas', [
            'total_hojas' => count($sheets),
            'tiempo_segundos' => $elapsed,
            'memoria_actual_mb' => $memoriaActual
        ]);
        
        return $sheets;
    }

    private function preCalcularTotales()
    {
        $query = DB::table('libros')
            ->select('area', DB::raw('COUNT(*) as total'))
            ->whereNotNull('area')
            ->when(!empty($this->filters['seccion_id']), function ($q) {
                return $q->where('seccion_id', $this->filters['seccion_id']);
            })
            ->groupBy('area');
            
        return $query->pluck('total', 'area')->toArray();
    }

    private function obtenerAreasDisponibles()
    {
        $query = DB::table('libros')
            ->select('area')
            ->whereNotNull('area')
            ->distinct();
            
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
        
        return $query->orderBy('area')->pluck('area')->toArray();
    }
}

class AreaSheet implements 
    FromQuery, 
    WithHeadings, 
    WithStyles, 
    ShouldAutoSize, 
    WithTitle, 
    WithMapping, 
    WithChunkReading,
    WithEvents  // ✅ SOLUCIÓN NUCLEAR
{
    protected $area;
    protected $filters;
    protected $chunkCounter = 0;
    protected $totalRows = 0; // ✅ Para el evento AfterSheet

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
        return 1000;
    }

    public function query()
    {
        $startTime = microtime(true);
        $memoriaInicio = memory_get_usage(true);
        
        Log::info("⏳ Iniciando query para área: {$this->area}", [
            'memoria_mb' => round($memoriaInicio / 1024 / 1024, 2)
        ]);
        
        $ejemplaresSubquery = DB::table('ejemplares')
            ->select([
                'libro_id',
                DB::raw('SUM(CASE WHEN estado = "' . Ejemplar::ESTADO_DISPONIBLE . '" THEN 1 ELSE 0 END) as disponibles'),
                DB::raw('SUM(CASE WHEN estado = "' . Ejemplar::ESTADO_PRESTADO . '" THEN 1 ELSE 0 END) as prestados'),
                DB::raw('SUM(CASE WHEN estado = "' . Ejemplar::ESTADO_DADO_DE_BAJA . '" THEN 1 ELSE 0 END) as dados_baja'),
                DB::raw('SUM(CASE WHEN estado = "' . Ejemplar::ESTADO_PERDIDO . '" THEN 1 ELSE 0 END) as perdidos')
            ])
            ->groupBy('libro_id');

        $query = DB::table('libros')
            ->leftJoin('autores', 'libros.autor_id', '=', 'autores.id')
            ->leftJoin('editoriales', 'libros.editorial_id', '=', 'editoriales.id')
            ->leftJoin('secciones', 'libros.seccion_id', '=', 'secciones.id')
            ->leftJoin('estanterias', 'libros.estanteria_id', '=', 'estanterias.id')
            ->leftJoinSub($ejemplaresSubquery, 'ej', function ($join) {
                $join->on('libros.id', '=', 'ej.libro_id');
            })
            ->select([
                'libros.fecha_ingreso',
                'libros.titulo',
                'libros.codigo_unico',
                'libros.clase',
                'libros.area',
                DB::raw("CONCAT(COALESCE(autores.nombres, ''), ' ', COALESCE(autores.apellidos, '')) as autor_completo"),
                'editoriales.nombre as editorial_nombre',
                'secciones.nombre as seccion_nombre',
                'estanterias.cod_estante',
                'libros.sign_top',
                DB::raw('COALESCE(ej.disponibles, 0) as disponibles'),
                DB::raw('COALESCE(ej.prestados, 0) as prestados'),
                DB::raw('COALESCE(ej.dados_baja, 0) as dados_baja'),
                DB::raw('COALESCE(ej.perdidos, 0) as perdidos')
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
                        return $query->where('ej.disponibles', '>', 0);
                    case 'prestados':
                        return $query->where('ej.prestados', '>', 0);
                    case 'dados_baja':
                        return $query->where('ej.dados_baja', '>', 0);
                    case 'perdidos':
                        return $query->where('ej.perdidos', '>', 0);
                    case 'en_circulacion':
                        return $query->whereRaw('(COALESCE(ej.disponibles, 0) + COALESCE(ej.prestados, 0)) > 0');
                }
                return $query;
            })
            ->orderBy('libros.titulo');
        
        $this->totalRows = $query->count(); // ✅ Guardar total para AfterSheet
        
        if ($this->totalRows > 15000) {
            Log::warning("⚠️ Área {$this->area} tiene {$this->totalRows} registros (límite recomendado: 15,000)");
        }
        
        $elapsed = round(microtime(true) - $startTime, 2);
        $memoriaFin = memory_get_usage(true);
        $memoriaUsada = round(($memoriaFin - $memoriaInicio) / 1024 / 1024, 2);
        
        Log::info("✅ Query completado para área: {$this->area}", [
            'registros' => $this->totalRows,
            'tiempo_segundos' => $elapsed,
            'memoria_usada_mb' => $memoriaUsada,
            'memoria_total_mb' => round($memoriaFin / 1024 / 1024, 2)
        ]);
        
        return $query;
    }

    public function map($row): array
    {
        $this->chunkCounter++;
        if ($this->chunkCounter % 1000 === 0) {
            $memoria = round(memory_get_usage(true) / 1024 / 1024, 2);
            Log::info("📊 Área {$this->area}: {$this->chunkCounter} registros procesados", [
                'memoria_mb' => $memoria
            ]);
        }
        
        $disponibles = (int) ($row->disponibles ?? 0);
        $prestados = (int) ($row->prestados ?? 0);
        $dadosBaja = (int) ($row->dados_baja ?? 0);
        $perdidos = (int) ($row->perdidos ?? 0);
        $totalActivos = $disponibles + $prestados;

        return [
            $row->fecha_ingreso ? date('d/m/Y', strtotime($row->fecha_ingreso)) : 'N/A',
            $row->titulo ?? 'N/A',
            $row->codigo_unico ?? 'N/A',
            trim($row->autor_completo) ?: 'Sin autor',
            $row->editorial_nombre ?? 'Sin editorial',
            $row->clase ?? 'N/A',
            $row->area ?? 'N/A',
            $row->sign_top ?? 'N/A',
            $row->seccion_nombre ?? 'Sin sección',
            $row->cod_estante ?? 'N/A',
            $disponibles,
            $prestados,
            $dadosBaja,
            $perdidos,
            $totalActivos,
        ];
    }

    /**
     * SOLUCIÓN: Formato "0" SOLO en columna Total Activos (O) Y SOLO en filas con datos
     */
    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function(AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();
                $lastRow = $this->totalRows + 1;
                
                // SOLO columna O (Total Activos)
                $col = 'O';
                
                // SOLO aplicar a filas con datos reales
                for ($row = 2; $row <= $lastRow; $row++) {
                    // Verificar si la fila tiene datos (columna B - Título - no vacía)
                    $tituloCell = $sheet->getCell("B{$row}")->getValue();
                    
                    if (!empty($tituloCell) && $tituloCell !== 'N/A') {
                        $cell = $sheet->getCell("{$col}{$row}");
                        $value = $cell->getValue();
                        
                        // Aplicar formato '0' solo a esta celda
                        $cell->getStyle()->getNumberFormat()->setFormatCode('0');
                        
                        $numValue = is_numeric($value) ? (int)$value : 0;
                        $cell->setValueExplicit($numValue, DataType::TYPE_NUMERIC);
                    }
                }
                
                Log::info("Formato '0' aplicado a columna Total Activos: {$this->area}", [
                    'filas_procesadas' => $lastRow - 1
                ]);
            },
        ];
    }

    public function headings(): array
    {
        return [
            'Fecha Ingreso',
            'Título',
            'Código Único',
            'Autor',
            'Editorial',
            'Clase',
            'Área',
            'Signatura Topográfica',
            'Sección',
            'Estantería',
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
                'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF'], 'size' => 12],
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '4472C4']],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
            ],
            'A:O' => [
                'alignment' => ['vertical' => Alignment::VERTICAL_CENTER],
            ],
            'H:H' => [
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
            ],
            'K:O' => [
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
                'font' => ['bold' => true],
            ],
        ];
    }
}

class ResumenSheet implements 
    FromQuery, 
    WithHeadings, 
    WithStyles, 
    ShouldAutoSize, 
    WithTitle, 
    WithMapping,
    WithChunkReading,
    WithEvents  // SOLUCIÓN NUCLEAR
{
    protected $filters;
    protected $totalRows = 0; // Para el evento AfterSheet

    public function __construct($filters = [])
    {
        $this->filters = $filters;
    }

    public function title(): string
    {
        return 'RESUMEN GENERAL';
    }

    public function chunkSize(): int
    {
        return 1000;
    }

    public function query()
    {
        $startTime = microtime(true);
        Log::info('📊 Generando hoja de resumen general');
        
        $ejemplaresSubquery = DB::table('ejemplares')
            ->select([
                'libro_id',
                DB::raw('COUNT(*) as total_ejemplares'),
                DB::raw('SUM(CASE WHEN estado = "' . Ejemplar::ESTADO_DISPONIBLE . '" THEN 1 ELSE 0 END) as disponibles'),
                DB::raw('SUM(CASE WHEN estado = "' . Ejemplar::ESTADO_PRESTADO . '" THEN 1 ELSE 0 END) as prestados'),
                DB::raw('SUM(CASE WHEN estado = "' . Ejemplar::ESTADO_DADO_DE_BAJA . '" THEN 1 ELSE 0 END) as dados_baja'),
                DB::raw('SUM(CASE WHEN estado = "' . Ejemplar::ESTADO_PERDIDO . '" THEN 1 ELSE 0 END) as perdidos')
            ])
            ->groupBy('libro_id');

        $query = DB::table('libros')
            ->leftJoinSub($ejemplaresSubquery, 'ej', function ($join) {
                $join->on('libros.id', '=', 'ej.libro_id');
            })
            ->select([
                'libros.area',
                DB::raw('COUNT(DISTINCT libros.id) as total_libros'),
                DB::raw('SUM(COALESCE(ej.total_ejemplares, 0)) as total_ejemplares'),
                DB::raw('SUM(COALESCE(ej.disponibles, 0)) as disponibles'),
                DB::raw('SUM(COALESCE(ej.prestados, 0)) as prestados'),
                DB::raw('SUM(COALESCE(ej.dados_baja, 0)) as dados_baja'),
                DB::raw('SUM(COALESCE(ej.perdidos, 0)) as perdidos')
            ])
            ->whereNotNull('libros.area')
            ->when(!empty($this->filters['seccion_id']), function ($query) {
                return $query->where('libros.seccion_id', $this->filters['seccion_id']);
            })
            ->when(!empty($this->filters['clase']), function ($query) {
                return $query->where('libros.clase', $this->filters['clase']);
            })
            ->groupBy('libros.area')
            ->orderBy('libros.area');
        
        $this->totalRows = $query->count(); //Guardar total
            
        $elapsed = round(microtime(true) - $startTime, 2);
        Log::info('Resumen general completado', ['tiempo_segundos' => $elapsed]);
        
        return $query;
    }

    public function map($row): array
    {
        $disponibles = (int) ($row->disponibles ?? 0);
        $prestados = (int) ($row->prestados ?? 0);
        
        return [
            $row->area,
            (int) ($row->total_libros ?? 0),
            (int) ($row->total_ejemplares ?? 0),
            $disponibles,
            $prestados,
            (int) ($row->dados_baja ?? 0),
            (int) ($row->perdidos ?? 0),
            $disponibles + $prestados,
        ];
    }

    /**
     * SOLUCIÓN: Formato "0" SOLO en columna Total Activos (H) Y SOLO en filas con datos
     */
    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function(AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();
                $lastRow = $this->totalRows + 1;
                
                //SOLO columna H (Total Activos)
                $col = 'H';
                
                // SOLO aplicar a filas con datos reales
                for ($row = 2; $row <= $lastRow; $row++) {
                    // Verificar si la fila tiene datos (columna A no vacía)
                    $areaCell = $sheet->getCell("A{$row}")->getValue();
                    
                    if (!empty($areaCell)) {
                        $cell = $sheet->getCell("{$col}{$row}");
                        $value = $cell->getValue();
                        
                        // Aplicar formato '0' solo a esta celda
                        $cell->getStyle()->getNumberFormat()->setFormatCode('0');
                        
                        $numValue = is_numeric($value) ? (int)$value : 0;
                        $cell->setValueExplicit($numValue, DataType::TYPE_NUMERIC);
                    }
                }
                
                Log::info("Formato '0' aplicado a columna Total Activos del resumen");
            },
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
                'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF'], 'size' => 12],
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '28A745']],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
            ],
            'A:H' => [
                'alignment' => ['vertical' => Alignment::VERTICAL_CENTER],
            ],
            'B:H' => [
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
                'font' => ['bold' => true],
            ],
        ];
    }
}