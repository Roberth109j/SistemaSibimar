<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Informe de Prestamos Realizados</title>
    <style>
        @page { margin: 15px 10px; }
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
        .institucion {
            font-size: 11px;
            font-weight: bold;
            color: #374151;
            margin-bottom: 3px;
        }
        .stats-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
        }
        .stats-cell {
            width: 25%;
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
            page-break-inside: auto;
        }
        thead { display: table-header-group; }
        tfoot { display: table-footer-group; }
        tr { page-break-inside: avoid; page-break-after: auto; }
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
        .badge-activo { background-color: #dbeafe; color: #1e40af; }
        .badge-devuelto { background-color: #dcfce7; color: #166534; }
        .badge-vencido { background-color: #fecaca; color: #dc2626; }
        .footer {
            margin-top: 20px;
            text-align: center;
            color: #6b7280;
            font-size: 7px;
            border-top: 1px solid #e5e7eb;
            padding-top: 5px;
        }
        .text-center { text-align: center; }
        /* AJUSTE SOLO PARA NOMBRES COMPLETOS */
        .nombre-completo {
            word-wrap: break-word;
            white-space: normal;
            max-width: none;
            overflow: visible;
        }
        .header, .footer { page-break-inside: avoid; }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">INFORME DE PRESTAMOS REALIZADOS</div>
        <div class="institucion">Colegio Liceo de la Merced Maridiaz Franciscanas</div>
        <div class="subtitle">Periodo: {{ $periodo['inicio'] }} - {{ $periodo['fin'] }}</div>
        <div class="subtitle">Generado el: {{ date('d/m/Y H:i') }}</div>
    </div>

    <!-- Estadisticas Generales -->
    <table class="stats-table">
        <tr>
            <td class="stats-cell">
                <div class="stats-number">{{ $estadisticas['total_prestamos'] }}</div>
                <div class="stats-label">Total Prestamos</div>
            </td>
            <td class="stats-cell">
                <div class="stats-number">{{ $estadisticas['prestamos_devueltos'] }}</div>
                <div class="stats-label">Devueltos</div>
            </td>
            <td class="stats-cell">
                <div class="stats-number">{{ $estadisticas['prestamos_activos'] }}</div>
                <div class="stats-label">Activos</div>
            </td>
            <td class="stats-cell">
                <div class="stats-number">{{ $estadisticas['prestamos_vencidos'] }}</div>
                <div class="stats-label">Vencidos</div>
            </td>
        </tr>
    </table>

    <!-- Libros Mas Prestados -->
    @if(count($estadisticas['libros_mas_prestados']) > 0)
    <div class="section">
        <div class="section-title">Libros Mas Prestados</div>
        <table>
            <thead>
                <tr>
                    <th>Titulo</th>
                    <th>Autor</th>
                    <th class="text-center">Cantidad</th>
                </tr>
            </thead>
            <tbody>
                @foreach($estadisticas['libros_mas_prestados']->take(10) as $libro)
                <tr>
                    <td class="nombre-completo">{{ $libro['titulo'] }}</td>
                    <td class="nombre-completo">{{ $libro['autor'] }}</td>
                    <td class="text-center">{{ $libro['cantidad'] }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
    @endif

    <!-- Detalle de Prestamos - SOLO NOMBRES COMPLETOS -->
    <div class="section">
        <div class="section-title">Detalle Completo de Prestamos ({{ count($prestamos) }} registros)</div>
        <table>
            <thead>
                <tr>
                    <th>Fecha</th>
                    <th>Lector</th>
                    <th>Grado</th>
                    <th>Libro</th>
                    <th class="text-center">Ejemplar</th>
                    <th>Estado</th>
                    <th>F. Devolucion</th>
                </tr>
            </thead>
            <tbody>
                @foreach($prestamos as $prestamo)
                    <tr>
                        <td>{{ \Carbon\Carbon::parse($prestamo->fecha_prestamo)->format('d/m/Y') }}</td>
                        <td class="nombre-completo">
                            {{ $prestamo->lector->nombre ?? 'N/A' }}
                            @if($prestamo->lector->codigo)
                            <br><span style="font-size: 6px; color: #666;">{{ $prestamo->lector->codigo }}</span>
                            @endif
                        </td>
                        <td>{{ $prestamo->lector->grado->subGrado ?? 'N/A' }}</td>
                        <td class="nombre-completo">{{ $prestamo->ejemplar->libro->titulo ?? 'N/A' }}</td>
                        <td class="text-center">{{ $prestamo->ejemplar->numEjemplar ?? 'N/A' }}</td>
                        <td>
                            <span class="badge badge-{{ strtolower($prestamo->estado) }}">
                                {{ $prestamo->estado }}
                            </span>
                        </td>
                        <td>
                            {{ $prestamo->fecha_devuelto 
                                ? \Carbon\Carbon::parse($prestamo->fecha_devuelto)->format('d/m/Y')
                                : \Carbon\Carbon::parse($prestamo->fecha_devolucion)->format('d/m/Y')
                            }}
                        </td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    </div>

    <div class="footer">
        Sistema de Gestion Bibliotecaria - Informe generado automaticamente<br>
        Total de registros mostrados: {{ count($prestamos) }}
    </div>
</body>
</html>