import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Users, BookMarked, AlertCircle, UserCheck, Clock, CheckCircle, TrendingUp, Calendar, Star } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, LineChart, Line } from 'recharts';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

interface DashboardProps {
    librosMasPrestados: Array<{
        id: number;
        titulo: string;
        total_prestamos: number;
    }>;
    lectoresFrecuentes: Array<{
        id: number;
        nombre: string;
        total_prestamos: number;
        grado: {
            grado: string;
            subGrado: string;
        };
    }>;
    estadisticasGenerales: {
        total_prestamos: number;
        prestamos_activos: number;
        prestamos_vencidos: number;
        total_libros: number;
        total_lectores: number;
        total_ejemplares: number;
    };
    prestamosPorMes: Array<{
        mes: string;
        total: number;
    }>;
    estadisticasDevolucion: {
        devueltos_tiempo: number;
        devueltos_tarde: number;
    };
    tasaDevolucionTiempo: number;
}

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ElementType;
    trend?: boolean;
    trendValue?: string;
    colorClass: string;
    bgClass: string;
}

const StatCard = ({ title, value, icon: Icon, trend, trendValue, colorClass, bgClass }: StatCardProps) => (
    <Card className={`group relative overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${bgClass}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-gray-50/30 dark:to-gray-800/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-4 sm:px-6 pt-4 sm:pt-6 relative z-10">
            <CardTitle className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300 leading-relaxed">
                {title}
            </CardTitle>
            <div className={`p-2 sm:p-2.5 rounded-lg shadow-sm ${colorClass}`}>
                <Icon className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
            </div>
        </CardHeader>
        <CardContent className="relative z-10 px-4 sm:px-6 pb-4 sm:pb-6">
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {value}
            </div>
            {trend && (
                <div className="flex items-center gap-1 mt-2">
                    <TrendingUp className="h-3 w-3 text-green-600 dark:text-green-400" />
                    <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                        {trendValue}
                    </span>
                </div>
            )}
        </CardContent>
    </Card>
);

const ListCard = ({
    title,
    items,
    type,
    icon: Icon,
    colorClass
}: {
    title: string;
    items: Array<any>;
    type: 'books' | 'readers';
    icon: React.ElementType;
    colorClass: string;
}) => (
    <Card className="border border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-800 overflow-hidden">
        <CardHeader className={`${colorClass} text-white px-4 sm:px-6 py-4 sm:py-5`}>
            <CardTitle className="flex items-center gap-2 sm:gap-3 text-base sm:text-lg font-bold">
                <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                {title}
            </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
            <div className="space-y-3 sm:space-y-4">
                {items.map((item, index) => (
                    <div
                        key={item.id}
                        className="flex items-center p-3 sm:p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 border border-gray-100 dark:border-gray-600/50"
                    >
                        <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-700 dark:bg-gray-500 text-white text-xs sm:text-sm font-bold shrink-0">
                            {type === 'books' ? index + 1 : item.nombre.charAt(0)}
                        </div>
                        <div className="ml-3 sm:ml-4 flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate">
                                {type === 'books' ? item.titulo : item.nombre}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate mt-0.5">
                                {type === 'books'
                                    ? `${item.total_prestamos} préstamos`
                                    : `${item.grado ? `${item.grado.grado} ${item.grado.subGrado || ''}` : 'N/A'}`
                                }
                            </p>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 shrink-0">
                            {type === 'books' ? <BookOpen className="h-4 w-4" /> : <BookMarked className="h-4 w-4" />}
                            <span className="text-sm font-semibold">{item.total_prestamos}</span>
                        </div>
                    </div>
                ))}
            </div>
        </CardContent>
    </Card>
);

export default function Dashboard({
    librosMasPrestados,
    lectoresFrecuentes,
    estadisticasGenerales,
    prestamosPorMes,
    estadisticasDevolucion,
    tasaDevolucionTiempo
}: DashboardProps) {

    const chartColors = {
        primary: '#6366f1',
        secondary: '#8b5cf6',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        area: 'rgba(99, 102, 241, 0.1)'
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard - Biblioteca Digital" />

            {/* Header responsivo con mejor espaciado */}
            <div className="mb-6 sm:mb-8 lg:mb-10 px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6">
                    <div className="space-y-2">
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 dark:text-white leading-tight">
                            Biblioteca Digital
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base lg:text-lg font-medium">
                            Panel de control y estadísticas
                        </p>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 bg-gray-50 dark:bg-gray-800 px-3 sm:px-4 py-2 sm:py-3 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                        <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-400" />
                        <span className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                            {new Date().toLocaleDateString('es-ES', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </span>
                    </div>
                </div>
            </div>

            <div className="space-y-6 sm:space-y-8 lg:space-y-10 px-4 sm:px-6 lg:px-8">
                {/* Tarjetas de estadísticas - Grid completamente responsivo */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-5 lg:gap-6">
                    <StatCard
                        title="Total Préstamos"
                        value={estadisticasGenerales.total_prestamos.toLocaleString()}
                        icon={BookOpen}
                        trend={true}
                        trendValue="+12% este mes"
                        colorClass="bg-blue-600"
                        bgClass="bg-white dark:bg-gray-800"
                    />
                    <StatCard
                        title="Préstamos Activos"
                        value={estadisticasGenerales.prestamos_activos.toLocaleString()}
                        icon={BookMarked}
                        trend={true}
                        trendValue="En proceso"
                        colorClass="bg-green-600"
                        bgClass="bg-white dark:bg-gray-800"
                    />
                    <StatCard
                        title="Préstamos Vencidos"
                        value={estadisticasGenerales.prestamos_vencidos.toLocaleString()}
                        icon={AlertCircle}
                        trend={false}
                        colorClass="bg-red-600"
                        bgClass="bg-white dark:bg-gray-800"
                    />
                    <StatCard
                        title="Total Libros"
                        value={estadisticasGenerales.total_libros.toLocaleString()}
                        icon={BookOpen}
                        trend={true}
                        trendValue="Colección completa"
                        colorClass="bg-purple-600"
                        bgClass="bg-white dark:bg-gray-800"
                    />
                    <StatCard
                        title="Total Ejemplares"
                        value={estadisticasGenerales.total_ejemplares.toLocaleString()}
                        icon={BookOpen}
                        trend={true}
                        trendValue="Material disponible"
                        colorClass="bg-yellow-600"
                        bgClass="bg-white dark:bg-gray-800"
                    />
                    <StatCard
                        title="Lectores Activos"
                        value={estadisticasGenerales.total_lectores.toLocaleString()}
                        icon={Users}
                        trend={true}
                        trendValue="+8% este mes"
                        colorClass="bg-indigo-600"
                        bgClass="bg-white dark:bg-gray-800"
                    />
                </div>

                {/* Sección de listas con mejor responsividad */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
                    <ListCard
                        title="Libros Más Prestados"
                        items={librosMasPrestados}
                        type="books"
                        icon={Star}
                        colorClass="bg-blue-600"
                    />
                    <ListCard
                        title="Lectores Frecuentes"
                        items={lectoresFrecuentes}
                        type="readers"
                        icon={UserCheck}
                        colorClass="bg-green-600"
                    />
                </div>

                {/* Gráficos optimizados para móvil */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
                    {/* Gráfico de préstamos por mes */}
                    <Card className="border border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-800 overflow-hidden">
                        <CardHeader className="bg-indigo-600 text-white px-4 sm:px-6 py-4 sm:py-5">
                            <CardTitle className="flex items-center gap-2 sm:gap-3 text-base sm:text-lg font-bold">
                                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
                                Préstamos por Mes
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6">
                            <div className="h-[250px] sm:h-[280px] lg:h-[320px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart
                                        data={prestamosPorMes}
                                        margin={{
                                            top: 10,
                                            right: 10,
                                            left: 0,
                                            bottom: 10
                                        }}
                                    >
                                        <defs>
                                            <linearGradient id="colorPrestamos" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={chartColors.primary} stopOpacity={0.3} />
                                                <stop offset="95%" stopColor={chartColors.primary} stopOpacity={0.05} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                                        <XAxis
                                            dataKey="mes"
                                            tick={{ fontSize: 11, fill: 'currentColor' }}
                                            className="text-gray-600 dark:text-gray-400"
                                            interval={0}
                                            angle={-45}
                                            textAnchor="end"
                                            height={60}
                                        />
                                        <YAxis
                                            tick={{ fontSize: 11, fill: 'currentColor' }}
                                            className="text-gray-600 dark:text-gray-400"
                                            width={40}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'rgb(255 255 255)',
                                                border: '1px solid rgb(229 231 235)',
                                                borderRadius: '8px',
                                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                                color: 'rgb(17 24 39)',
                                                fontSize: '12px'
                                            }}
                                            labelStyle={{ color: 'rgb(75 85 99)' }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="total"
                                            stroke={chartColors.primary}
                                            strokeWidth={2}
                                            fill="url(#colorPrestamos)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Estadísticas de devolución optimizadas */}
                    <Card className="border border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-800 overflow-hidden">
                        <CardHeader className="bg-green-600 text-white px-4 sm:px-6 py-4 sm:py-5">
                            <CardTitle className="flex items-center gap-2 sm:gap-3 text-base sm:text-lg font-bold">
                                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                                Estadísticas de Devolución
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6">
                            <div className="h-[250px] sm:h-[280px] lg:h-[320px]">
                                <div className="flex flex-col items-center justify-center h-full space-y-4 sm:space-y-6">
                                    {/* Indicador principal más responsivo */}
                                    <div className="relative">
                                        <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full bg-green-600 flex items-center justify-center shadow-lg">
                                            <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center">
                                                <div className="text-center">
                                                    <div className="text-base sm:text-lg lg:text-xl font-bold text-green-600 dark:text-green-400">
                                                        {tasaDevolucionTiempo}%
                                                    </div>
                                                    <div className="text-xs text-gray-600 dark:text-gray-400">A tiempo</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Estadísticas detalladas responsivas */}
                                    <div className="w-full grid grid-cols-2 gap-3 sm:gap-4 max-w-sm">
                                        <div className="bg-green-50 dark:bg-green-900/20 p-3 sm:p-4 rounded-xl text-center border border-green-200 dark:border-green-800">
                                            <div className="text-base sm:text-lg lg:text-xl font-bold text-green-600 dark:text-green-400">
                                                {estadisticasDevolucion.devueltos_tiempo.toLocaleString()}
                                            </div>
                                            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                A tiempo
                                            </div>
                                        </div>
                                        <div className="bg-red-50 dark:bg-red-900/20 p-3 sm:p-4 rounded-xl text-center border border-red-200 dark:border-red-800">
                                            <div className="text-base sm:text-lg lg:text-xl font-bold text-red-600 dark:text-red-400">
                                                {estadisticasDevolucion.devueltos_tarde.toLocaleString()}
                                            </div>
                                            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                Con retraso
                                            </div>
                                        </div>
                                    </div>

                                    {/* Mini gráfico optimizado */}
                                    <div className="w-full h-12 sm:h-16 lg:h-20 max-w-xs">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={[
                                                        { name: 'A tiempo', value: estadisticasDevolucion.devueltos_tiempo },
                                                        { name: 'Con retraso', value: estadisticasDevolucion.devueltos_tarde }
                                                    ]}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={12}
                                                    outerRadius={25}
                                                    dataKey="value"
                                                    stroke="none"
                                                >
                                                    <Cell fill={chartColors.success} />
                                                    <Cell fill={chartColors.danger} />
                                                </Pie>
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: 'rgb(255 255 255)',
                                                        border: '1px solid rgb(229 231 235)',
                                                        borderRadius: '8px',
                                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                                        fontSize: '11px'
                                                    }}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}