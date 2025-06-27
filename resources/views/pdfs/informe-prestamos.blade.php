?>

<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Informe de Préstamos Realizados</title>
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
            border-bottom: 2px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .title {
            font-size: 18px;
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 10px;
        }
        .subtitle {
            color: #6b7280;
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
            width: 25%;
            padding: 15px;
            border: 1px solid #e5e7eb;
            text-align: center;
            background-color: #f9fafb;
        }
        .stats-number {
            font-size: 24px;
            font-weight: bold;
            color: #1e40af;
        }
        .stats-label {
            color: #6b7280;
            font-size: 11px;
        }
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
        .badge-devuelto { background-color: #dcfce7; color: #166534; }
        .badge-vencido { background-color: #fecaca; color: #dc2626; }
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
        <div class="title">INFORME DE PRÉSTAMOS REALIZADOS</div>
        <div class="subtitle">Período: {{ $periodo['inicio'] }} - {{ $periodo['fin'] }}</div>
        <div class="subtitle">Generado el: {{ date('d/m/Y H:i') }}</div>
    </div>

    <!-- Estadísticas Generales -->
    <div class="stats-grid">
        <div class="stats-row">
            <div class="stats-cell">
                <div class="stats-number">{{ $estadisticas['total_prestamos'] }}</div>
                <div class="stats-label">Total Préstamos</div>
            </div>
            <div class="stats-cell">
                <div class="stats-number">{{ $estadisticas['prestamos_devueltos'] }}</div>
                <div class="stats-label">Devueltos</div>
            </div>
            <div class="stats-cell">
                <div class="stats-number">{{ $estadisticas['prestamos_activos'] }}</div>
                <div class="stats-label">Activos</div>
            </div>
            <div class="stats-cell">
                <div class="stats-number">{{ $estadisticas['prestamos_vencidos'] }}</div>
                <div class="stats-label">Vencidos</div>
            </div>
        </div>
    </div>

    <!-- Libros Más Prestados -->
    @if($estadisticas['libros_mas_prestados']->count() > 0)
    <div class="section">
        <div class="section-title">Libros Más Prestados</div>
        <table>
            <thead>
                <tr>
                    <th>Título</th>
                    <th>Autor</th>
                    <th>Cantidad</th>
                </tr>
            </thead>
            <tbody>
                @foreach($estadisticas['libros_mas_prestados']->take(10) as $libro)
                <tr>
                    <td>{{ $libro['titulo'] }}</td>
                    <td>{{ $libro['autor'] }}</td>
                    <td>{{ $libro['cantidad'] }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
    @endif

    <!-- Detalle de Préstamos -->
    <div class="section">
        <div class="section-title">Detalle de Préstamos ({{ $prestamos->count() }} registros)</div>
        <table>
            <thead>
                <tr>
                    <th>Fecha</th>
                    <th>Lector</th>
                    <th>Grado</th>
                    <th>Libro</th>
                    <th>Estado</th>
                    <th>F. Devolución</th>
                </tr>
            </thead>
            <tbody>
                @foreach($prestamos->take(50) as $prestamo)
                <tr>
                    <td>{{ \Carbon\Carbon::parse($prestamo->fecha_prestamo)->format('d/m/Y') }}</td>
                    <td>{{ $prestamo->lector->nombre }}</td>
                    <td>{{ $prestamo->lector->grado->subGrado ?? 'N/A' }}</td>
                    <td>{{ Str::limit($prestamo->ejemplar->libro->titulo, 40) }}</td>
                    <td>
                        <span class="badge badge-{{ strtolower($prestamo->estado) }}">
                            {{ $prestamo->estado }}
                        </span>
                    </td>
                    <td>{{ \Carbon\Carbon::parse($prestamo->fecha_devolucion)->format('d/m/Y') }}</td>
                </tr>
                @endforeach
                @if($prestamos->count() > 50)
                <tr>
                    <td colspan="6" style="text-align: center; font-style: italic; color: #6b7280;">
                        ... y {{ $prestamos->count() - 50 }} préstamos más
                    </td>
                </tr>
                @endif
            </tbody>
        </table>
    </div>

    <div class="footer">
        Sistema de Gestión Bibliotecaria - Informe generado automáticamente
    </div>
</body>
</html>