<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Informe de Libros Vencidos No Devueltos</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 10px;
            line-height: 1.2;
            margin: 0;
            padding: 10px;
            color: #333;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #dc2626;
            padding-bottom: 10px;
            margin-bottom: 15px;
        }
        .title {
            font-size: 14px;
            font-weight: bold;
            color: #dc2626;
            margin-bottom: 5px;
        }
        .subtitle {
            color: #6b7280;
            margin-bottom: 2px;
            font-size: 9px;
        }
        .alert-box {
            background-color: #fef2f2;
            border: 1px solid #fecaca;
            border-left: 4px solid #dc2626;
            padding: 8px;
            margin-bottom: 15px;
            border-radius: 2px;
        }
        .alert-title {
            font-weight: bold;
            color: #dc2626;
            margin-bottom: 2px;
            font-size: 10px;
        }
        .stats-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
        }
        .stats-cell {
            width: 33.33%;
            padding: 8px;
            border: 1px solid #e5e7eb;
            text-align: center;
            background-color: #fef2f2;
        }
        .stats-number {
            font-size: 16px;
            font-weight: bold;
            color: #dc2626;
        }
        .stats-label {
            color: #6b7280;
            font-size: 8px;
            margin-top: 2px;
        }
        .severity-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
        }
        .severity-cell {
            width: 25%;
            padding: 6px;
            border: 1px solid #e5e7eb;
            text-align: center;
        }
        .severity-critico { background-color: #fecaca; color: #7f1d1d; }
        .severity-alto { background-color: #fed7aa; color: #9a3412; }
        .severity-medio { background-color: #dbeafe; color: #1e3a8a; }
        .severity-bajo { background-color: #dcfce7; color: #14532d; }
        .section {
            margin-bottom: 15px;
        }
        .section-title {
            font-size: 11px;
            font-weight: bold;
            color: #374151;
            margin-bottom: 8px;
            border-bottom: 1px solid #d1d5db;
            padding-bottom: 2px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10px;
        }
        th, td {
            border: 1px solid #e5e7eb;
            padding: 4px;
            text-align: left;
            font-size: 8px;
        }
        th {
            background-color: #f3f4f6;
            font-weight: bold;
        }
        .badge {
            padding: 1px 3px;
            border-radius: 2px;
            font-size: 7px;
            font-weight: bold;
        }
        .badge-vencido { background-color: #fecaca; color: #dc2626; }
        .dias-retraso {
            font-weight: bold;
        }
        .dias-critico { color: #dc2626; }
        .dias-alto { color: #ea580c; }
        .dias-medio { color: #2563eb; }
        .dias-bajo { color: #059669; }
        .footer {
            margin-top: 20px;
            text-align: center;
            color: #6b7280;
            font-size: 7px;
            border-top: 1px solid #e5e7eb;
            padding-top: 5px;
        }
        .text-center { text-align: center; }
        .text-truncate {
            max-width: 80px;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">INFORME DE LIBROS VENCIDOS NO DEVUELTOS</div>
        <div class="subtitle">Periodo: {{ $periodo['inicio'] }} - {{ $periodo['fin'] }}</div>
        <div class="subtitle">Generado el: {{ date('d/m/Y H:i') }}</div>
    </div>

    <!-- Alerta Principal -->
    @if($estadisticas['total_no_devueltos'] > 0)
    <div class="alert-box">
        <div class="alert-title">ATENCION REQUERIDA</div>
        <div>Se encontraron {{ $estadisticas['total_no_devueltos'] }} libros vencidos no devueltos que requieren seguimiento inmediato.</div>
    </div>
    @endif

    <!-- Estadisticas Generales - CORREGIDAS -->
    <table class="stats-table">
        <tr>
            <td class="stats-cell">
                <div class="stats-number">{{ $estadisticas['total_no_devueltos'] }}</div>
                <div class="stats-label">Total Vencidos</div>
            </td>
            <td class="stats-cell">
                <div class="stats-number">{{ $estadisticas['por_severidad']['critico'] }}</div>
                <div class="stats-label">Criticos (30+ dias)</div>
            </td>
            <td class="stats-cell">
                <div class="stats-number">{{ round($estadisticas['promedio_dias_retraso'] ?? 0) }}</div>
                <div class="stats-label">Dias Prom. Retraso</div>
            </td>
        </tr>
    </table>

    <!-- Analisis por Severidad -->
    @if($estadisticas['total_no_devueltos'] > 0)
    <div class="section">
        <div class="section-title">Analisis por Severidad de Retraso</div>
        <table class="severity-table">
            <tr>
                <td class="severity-cell severity-critico">
                    <div class="stats-number">{{ $estadisticas['por_severidad']['critico'] }}</div>
                    <div class="stats-label">Critico (30+ dias)</div>
                </td>
                <td class="severity-cell severity-alto">
                    <div class="stats-number">{{ $estadisticas['por_severidad']['alto'] }}</div>
                    <div class="stats-label">Alto (15-29 dias)</div>
                </td>
                <td class="severity-cell severity-medio">
                    <div class="stats-number">{{ $estadisticas['por_severidad']['medio'] }}</div>
                    <div class="stats-label">Medio (7-14 dias)</div>
                </td>
                <td class="severity-cell severity-bajo">
                    <div class="stats-number">{{ $estadisticas['por_severidad']['bajo'] }}</div>
                    <div class="stats-label">Bajo (1-6 dias)</div>
                </td>
            </tr>
        </table>
    </div>
    @endif

    <!-- Analisis por Grado -->
    @if(count($estadisticas['por_grado']) > 0)
    <div class="section">
        <div class="section-title">Analisis por Grado</div>
        <table>
            <thead>
                <tr>
                    <th>Grado</th>
                    <th class="text-center">Total Vencidos</th>
                    <th class="text-center">% del Total</th>
                </tr>
            </thead>
            <tbody>
                @foreach($estadisticas['por_grado'] as $grado)
                <tr>
                    <td>{{ $grado['grado'] }}</td>
                    <td class="text-center">{{ $grado['cantidad'] }}</td>
                    <td class="text-center">{{ round(($grado['cantidad'] / $estadisticas['total_no_devueltos']) * 100, 1) }}%</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
    @endif

    <!-- Detalle de Libros Vencidos No Devueltos - SIN SÍMBOLO # EN NÚMERO DE EJEMPLAR -->
    <div class="section">
        <div class="section-title">Detalle de Libros Vencidos No Devueltos ({{ count($prestamos_no_devueltos) }} registros)</div>
        <table>
            <thead>
                <tr>
                    <th>Estudiante</th>
                    <th>Codigo</th>
                    <th>Grado</th>
                    <th>Libro</th>
                    <th>Ejemplar</th>
                    <th>F. Prestamo</th>
                    <th>F. Vencimiento</th>
                    <th>Dias Retraso</th>
                    <th>Severidad</th>
                </tr>
            </thead>
            <tbody>
                @foreach($prestamos_no_devueltos as $index => $prestamo)
                    @if($index < 25)
                    @php
                        // CORRECCIÓN CRÍTICA: Asegurar que días_retraso sea siempre positivo
                        $diasRetraso = abs((int) floor($prestamo->dias_retraso ?? 0));
                        
                        $severidadClase = '';
                        $severidadTexto = '';
                        if ($diasRetraso >= 30) {
                            $severidadClase = 'dias-critico';
                            $severidadTexto = 'Crítico';
                        } elseif ($diasRetraso >= 15) {
                            $severidadClase = 'dias-alto';
                            $severidadTexto = 'Alto';
                        } elseif ($diasRetraso >= 7) {
                            $severidadClase = 'dias-medio';
                            $severidadTexto = 'Medio';
                        } else {
                            $severidadClase = 'dias-bajo';
                            $severidadTexto = 'Bajo';
                        }
                    @endphp
                    <tr>
                        <td class="text-truncate">{{ $prestamo->lector->nombre ?? 'N/A' }}</td>
                        <td>{{ $prestamo->lector->codigo ?? 'N/A' }}</td>
                        <td>{{ $prestamo->lector->grado->subGrado ?? 'N/A' }}</td>
                        <td class="text-truncate">{{ $prestamo->ejemplar->libro->titulo ?? 'N/A' }}</td>
                        <td class="text-center">{{ $prestamo->ejemplar->numEjemplar ?? 'N/A' }}</td>
                        <td>{{ \Carbon\Carbon::parse($prestamo->fecha_prestamo)->format('d/m/Y') }}</td>
                        <td>{{ \Carbon\Carbon::parse($prestamo->fecha_devolucion)->format('d/m/Y') }}</td>
                        <td class="text-center">
                            <span class="dias-retraso {{ $severidadClase }}">
                                {{ $diasRetraso }}
                            </span>
                        </td>
                        <td class="text-center">
                            <span class="{{ $severidadClase }}">{{ $severidadTexto }}</span>
                        </td>
                    </tr>
                    @endif
                @endforeach
                @if(count($prestamos_no_devueltos) > 25)
                <tr>
                    <td colspan="9" class="text-center" style="font-style: italic; color: #6b7280;">
                        ... y {{ count($prestamos_no_devueltos) - 25 }} prestamos vencidos mas
                    </td>
                </tr>
                @endif
            </tbody>
        </table>
    </div>

    <!-- Recomendaciones -->
    <div class="section">
        <div class="section-title">Recomendaciones de Accion</div>
        <div style="font-size: 9px; line-height: 1.3;">
            @if($estadisticas['por_severidad']['critico'] > 0)
            <p><strong>Accion Inmediata:</strong> {{ $estadisticas['por_severidad']['critico'] }} prestamos con mas de 30 dias de retraso requieren contacto inmediato y posible aplicacion de sanciones.</p>
            @endif
            
            @if($estadisticas['por_severidad']['alto'] > 0)
            <p><strong>Seguimiento Urgente:</strong> {{ $estadisticas['por_severidad']['alto'] }} prestamos con 15-29 dias de retraso necesitan seguimiento telefonico o citacion.</p>
            @endif
            
            @if($estadisticas['por_severidad']['medio'] > 0)
            <p><strong>Recordatorio:</strong> {{ $estadisticas['por_severidad']['medio'] }} prestamos con 7-14 dias de retraso requieren envio de recordatorios.</p>
            @endif
            
            @if($estadisticas['por_severidad']['bajo'] > 0)
            <p><strong>Atencion:</strong> {{ $estadisticas['por_severidad']['bajo'] }} prestamos con 1-6 dias de retraso requieren seguimiento.</p>
            @endif
        </div>
    </div>

    <div class="footer">
        Sistema de Gestion Bibliotecaria - Informe de Control y Seguimiento de Libros Vencidos
    </div>
</body>
</html>