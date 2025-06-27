<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Informe de Libros No Devueltos</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            line-height: 1.4;
            margin: 0;
            padding: 20px;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #dc2626;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .title {
            font-size: 18px;
            font-weight: bold;
            color: #dc2626;
            margin-bottom: 10px;
        }
        .subtitle {
            color: #6b7280;
            margin-bottom: 5px;
        }
        .alert-box {
            background-color: #fef2f2;
            border: 1px solid #fecaca;
            border-left: 4px solid #dc2626;
            padding: 15px;
            margin-bottom: 30px;
            border-radius: 4px;
        }
        .alert-title {
            font-weight: bold;
            color: #dc2626;
            margin-bottom: 5px;
        }
        .stats-grid {
            display: table;
            width: 100%;
            margin-bottom: 30px;
        }
        .stats-row {
            display: table-row;
        }
        .stats-cell {
            display: table-cell;
            width: 20%;
            padding: 15px;
            border: 1px solid #e5e7eb;
            text-align: center;
            background-color: #fef2f2;
        }
        .stats-number {
            font-size: 24px;
            font-weight: bold;
            color: #dc2626;
        }
        .stats-label {
            color: #6b7280;
            font-size: 11px;
        }
        .severity-grid {
            display: table;
            width: 100%;
            margin-bottom: 30px;
        }
        .severity-cell {
            display: table-cell;
            width: 20%;
            padding: 10px;
            border: 1px solid #e5e7eb;
            text-align: center;
        }
        .severity-critico { background-color: #fecaca; color: #7f1d1d; }
        .severity-alto { background-color: #fed7aa; color: #9a3412; }
        .severity-medio { background-color: #fef3c7; color: #92400e; }
        .severity-bajo { background-color: #fef9c3; color: #a16207; }
        .severity-activo { background-color: #dbeafe; color: #1e40af; }
        .section {
            margin-bottom: 30px;
        }
        .section-title {
            font-size: 14px;
            font-weight: bold;
            color: #374151;
            margin-bottom: 15px;
            border-bottom: 1px solid #d1d5db;
            padding-bottom: 5px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        th, td {
            border: 1px solid #e5e7eb;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #f3f4f6;
            font-weight: bold;
            font-size: 11px;
        }
        td {
            font-size: 10px;
        }
        .badge {
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 9px;
            font-weight: bold;
        }
        .badge-activo { background-color: #dbeafe; color: #1e40af; }
        .badge-vencido { background-color: #fecaca; color: #dc2626; }
        .dias-retraso {
            font-weight: bold;
        }
        .dias-critico { color: #dc2626; }
        .dias-alto { color: #ea580c; }
        .dias-medio { color: #d97706; }
        .dias-bajo { color: #ca8a04; }
        .footer {
            margin-top: 40px;
            text-align: center;
            color: #6b7280;
            font-size: 10px;
            border-top: 1px solid #e5e7eb;
            padding-top: 10px;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">INFORME DE LIBROS NO DEVUELTOS</div>
        <div class="subtitle">Período: {{ $periodo['inicio'] }} - {{ $periodo['fin'] }}</div>
        <div class="subtitle">Generado el: {{ date('d/m/Y H:i') }}</div>
    </div>

    <!-- Alerta Principal -->
    @if($estadisticas['total_no_devueltos'] > 0)
    <div class="alert-box">
        <div class="alert-title">⚠️ ATENCIÓN REQUERIDA</div>
        <div>Se encontraron {{ $estadisticas['total_no_devueltos'] }} libros pendientes de devolución que requieren seguimiento.</div>
    </div>
    @endif

    <!-- Estadísticas Generales -->
    <div class="stats-grid">
        <div class="stats-row">
            <div class="stats-cell">
                <div class="stats-number">{{ $estadisticas['total_no_devueltos'] }}</div>
                <div class="stats-label">Total No Devueltos</div>
            </div>
            <div class="stats-cell">
                <div class="stats-number">{{ $estadisticas['activos'] }}</div>
                <div class="stats-label">En Tiempo</div>
            </div>
            <div class="stats-cell">
                <div class="stats-number">{{ $estadisticas['vencidos'] }}</div>
                <div class="stats-label">Vencidos</div>
            </div>
            <div class="stats-cell">
                <div class="stats-number">{{ round($estadisticas['promedio_dias_retraso'] ?? 0) }}</div>
                <div class="stats-label">Días Prom. Retraso</div>
            </div>
        </div>
    </div>

    <!-- Análisis por Severidad -->
    @if($estadisticas['vencidos'] > 0)
    <div class="section">
        <div class="section-title">Análisis por Severidad de Retraso</div>
        <div class="severity-grid">
            <div class="stats-row">
                <div class="severity-cell severity-critico">
                    <div class="stats-number">{{ $estadisticas['por_severidad']['critico'] }}</div>
                    <div class="stats-label">Crítico (30+ días)</div>
                </div>
                <div class="severity-cell severity-alto">
                    <div class="stats-number">{{ $estadisticas['por_severidad']['alto'] }}</div>
                    <div class="stats-label">Alto (15-29 días)</div>
                </div>
                <div class="severity-cell severity-medio">
                    <div class="stats-number">{{ $estadisticas['por_severidad']['medio'] }}</div>
                    <div class="stats-label">Medio (7-14 días)</div>
                </div>
                <div class="severity-cell severity-bajo">
                    <div class="stats-number">{{ $estadisticas['por_severidad']['bajo'] }}</div>
                    <div class="stats-label">Bajo (1-6 días)</div>
                </div>
                <div class="severity-cell severity-activo">
                    <div class="stats-number">{{ $estadisticas['por_severidad']['activos'] }}</div>
                    <div class="stats-label">En Tiempo</div>
                </div>
            </div>
        </div>
    </div>
    @endif

    <!-- Análisis por Grado -->
    @if(count($estadisticas['por_grado']) > 0)
    <div class="section">
        <div class="section-title">Análisis por Grado</div>
        <table>
            <thead>
                <tr>
                    <th>Grado</th>
                    <th>Total</th>
                    <th>En Tiempo</th>
                    <th>Vencidos</th>
                    <th>% del Total</th>
                </tr>
            </thead>
            <tbody>
                @foreach($estadisticas['por_grado'] as $grado)
                <tr>
                    <td>{{ $grado['grado'] }}</td>
                    <td>{{ $grado['cantidad'] }}</td>
                    <td>{{ $grado['activos'] }}</td>
                    <td>{{ $grado['vencidos'] }}</td>
                    <td>{{ round(($grado['cantidad'] / $estadisticas['total_no_devueltos']) * 100, 1) }}%</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
    @endif

    <!-- Detalle de Libros No Devueltos -->
    <div class="section">
        <div class="section-title">Detalle de Libros No Devueltos ({{ $prestamos_no_devueltos->count() }} registros)</div>
        <table>
            <thead>
                <tr>
                    <th>Estudiante</th>
                    <th>Código</th>
                    <th>Grado</th>
                    <th>Libro</th>
                    <th>Ejemplar</th>
                    <th>F. Préstamo</th>
                    <th>F. Vencimiento</th>
                    <th>Días Retraso</th>
                    <th>Estado</th>
                </tr>
            </thead>
            <tbody>
                @foreach($prestamos_no_devueltos->sortByDesc('dias_retraso')->take(50) as $prestamo)
                @php
                    $severidadClase = '';
                    if ($prestamo->dias_retraso >= 30) $severidadClase = 'dias-critico';
                    elseif ($prestamo->dias_retraso >= 15) $severidadClase = 'dias-alto';
                    elseif ($prestamo->dias_retraso >= 7) $severidadClase = 'dias-medio';
                    elseif ($prestamo->dias_retraso > 0) $severidadClase = 'dias-bajo';
                @endphp
                <tr>
                    <td>{{ $prestamo->lector->nombre }}</td>
                    <td>{{ $prestamo->lector->codigo }}</td>
                    <td>{{ $prestamo->lector->grado->subGrado ?? 'N/A' }}</td>
                    <td>{{ Str::limit($prestamo->ejemplar->libro->titulo, 30) }}</td>
                    <td>#{{ $prestamo->ejemplar->numEjemplar }}</td>
                    <td>{{ \Carbon\Carbon::parse($prestamo->fecha_prestamo)->format('d/m/Y') }}</td>
                    <td>{{ \Carbon\Carbon::parse($prestamo->fecha_devolucion)->format('d/m/Y') }}</td>
                    <td>
                        <span class="dias-retraso {{ $severidadClase }}">
                            {{ $prestamo->dias_retraso > 0 ? $prestamo->dias_retraso : '0' }}
                        </span>
                    </td>
                    <td>
                        <span class="badge badge-{{ strtolower($prestamo->estado) }}">
                            {{ $prestamo->estado }}
                        </span>
                    </td>
                </tr>
                @endforeach
                @if($prestamos_no_devueltos->count() > 50)
                <tr>
                    <td colspan="9" style="text-align: center; font-style: italic; color: #6b7280;">
                        ... y {{ $prestamos_no_devueltos->count() - 50 }} préstamos más
                    </td>
                </tr>
                @endif
            </tbody>
        </table>
    </div>

    <!-- Recomendaciones -->
    <div class="section">
        <div class="section-title">Recomendaciones de Acción</div>
        <div style="font-size: 11px; line-height: 1.6;">
            @if($estadisticas['por_severidad']['critico'] > 0)
            <p><strong>🔴 Acción Inmediata:</strong> {{ $estadisticas['por_severidad']['critico'] }} préstamos con más de 30 días de retraso requieren contacto inmediato y posible aplicación de sanciones.</p>
            @endif
            
            @if($estadisticas['por_severidad']['alto'] > 0)
            <p><strong>🟠 Seguimiento Urgente:</strong> {{ $estadisticas['por_severidad']['alto'] }} préstamos con 15-29 días de retraso necesitan seguimiento telefónico o citación.</p>
            @endif
            
            @if($estadisticas['por_severidad']['medio'] > 0)
            <p><strong>🟡 Recordatorio:</strong> {{ $estadisticas['por_severidad']['medio'] }} préstamos con 7-14 días de retraso requieren envío de recordatorios.</p>
            @endif
            
            @if($estadisticas['activos'] > 0)
            <p><strong>🔵 Preventivo:</strong> {{ $estadisticas['activos'] }} préstamos activos próximos a vencer requieren recordatorio preventivo.</p>
            @endif
        </div>
    </div>

    <div class="footer">
        Sistema de Gestión Bibliotecaria - Informe de Control y Seguimiento
    </div>
</body>
</html>