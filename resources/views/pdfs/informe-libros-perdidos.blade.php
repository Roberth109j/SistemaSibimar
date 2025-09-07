<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Informe de Libros Perdidos</title>
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
            border-bottom: 2px solid #2563eb;
            padding-bottom: 10px;
            margin-bottom: 15px;
        }
        .title {
            font-size: 14px;
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 5px;
        }
        .subtitle {
            color: #6b7280;
            margin-bottom: 2px;
            font-size: 9px;
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
            background-color: #f9fafb;
        }
        .stats-number {
            font-size: 16px;
            font-weight: bold;
            color: #1e40af;
        }
        .stats-label {
            color: #6b7280;
            font-size: 8px;
            margin-top: 2px;
        }
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
        .badge-perdido { 
            background-color: #fecaca; 
            color: #dc2626; 
        }
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
        .alert {
            background-color: #fef2f2;
            border: 1px solid #fecaca;
            padding: 8px;
            margin-bottom: 15px;
            font-size: 8px;
            color: #dc2626;
        }
        .no-data {
            text-align: center;
            padding: 20px;
            color: #6b7280;
            font-style: italic;
            font-size: 9px;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">INFORME DE LIBROS PERDIDOS</div>
        <div class="subtitle">Periodo: {{ $periodo['inicio'] }} - {{ $periodo['fin'] }}</div>
        <div class="subtitle">Generado el: {{ date('d/m/Y H:i') }}</div>
    </div>

    <!-- Alerta si hay pérdidas -->
    @if($estadisticas['total_perdidos'] > 0)
    <div class="alert">
        Se registraron <strong>{{ $estadisticas['total_perdidos'] }}</strong> ejemplares como perdidos en el período seleccionado, 
        afectando <strong>{{ $estadisticas['libros_afectados'] }}</strong> títulos diferentes.
    </div>
    @endif

    <!-- Estadisticas Generales -->
    <table class="stats-table">
        <tr>
            <td class="stats-cell">
                <div class="stats-number">{{ $estadisticas['total_perdidos'] }}</div>
                <div class="stats-label">Ejemplares Perdidos</div>
            </td>
            <td class="stats-cell">
                <div class="stats-number">{{ $estadisticas['libros_afectados'] }}</div>
                <div class="stats-label">Libros Afectados</div>
            </td>
            <td class="stats-cell">
                <div class="stats-number">
                    {{ count($estadisticas['por_mes']) > 0 ? round($estadisticas['total_perdidos'] / count($estadisticas['por_mes'])) : 0 }}
                </div>
                <div class="stats-label">Promedio Mensual</div>
            </td>
        </tr>
    </table>

    <!-- Detalle de Libros Perdidos -->
    <div class="section">
        <div class="section-title">Detalle de Ejemplares Perdidos ({{ count($ejemplares_perdidos) }} registros)</div>
        
        @if(count($ejemplares_perdidos) > 0)
        <table>
            <thead>
                <tr>
                    <th>Titulo</th>
                    <th>Autor</th>
                    <th class="text-center">Ejemplar</th>
                    <th>Fecha Perdida</th>
                    <th>Observaciones</th>
                </tr>
            </thead>
            <tbody>
                @foreach($ejemplares_perdidos as $index => $ejemplar)
                    @if($index < 30)
                    <tr>
                        <td class="text-truncate">{{ $ejemplar->libro->titulo }}</td>
                        <td class="text-truncate">{{ $ejemplar->libro->autor->nombres }} {{ $ejemplar->libro->autor->apellidos }}</td>
                        <td class="text-center">{{ $ejemplar->numEjemplar }}</td>
                        <td>{{ $ejemplar->fecha_perdida_formateada }}</td>
                        <td style="word-wrap: break-word; white-space: normal; max-width: 100px;">{{ $ejemplar->observaciones ?: 'Sin observaciones' }}</td>
                    </tr>
                    @endif
                @endforeach
                @if(count($ejemplares_perdidos) > 30)
                <tr>
                    <td colspan="5" class="text-center" style="font-style: italic; color: #6b7280;">
                        ... y {{ count($ejemplares_perdidos) - 30 }} ejemplares mas
                    </td>
                </tr>
                @endif
            </tbody>
        </table>
        @else
        <div class="no-data">
            No se encontraron libros perdidos en el período seleccionado.
        </div>
        @endif
    </div>

    <!-- Distribución por mes -->
    @if(count($estadisticas['por_mes']) > 0 && $estadisticas['total_perdidos'] > 0)
    <div class="section">
        <div class="section-title">Distribucion Mensual de Perdidas</div>
        <table>
            <thead>
                <tr>
                    <th>Mes</th>
                    <th class="text-center">Cantidad</th>
                    <th class="text-center">Porcentaje</th>
                </tr>
            </thead>
            <tbody>
                @foreach($estadisticas['por_mes'] as $mes)
                @if($mes['cantidad'] > 0)
                <tr>
                    <td>{{ $mes['mes'] }}</td>
                    <td class="text-center">{{ $mes['cantidad'] }}</td>
                    <td class="text-center">{{ round(($mes['cantidad'] / $estadisticas['total_perdidos']) * 100, 1) }}%</td>
                </tr>
                @endif
                @endforeach
            </tbody>
        </table>
    </div>
    @endif

    <div class="footer">
        Sistema de Gestion Bibliotecaria - Informe generado automaticamente
    </div>
</body>
</html>