import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    BookOpen, Users, BookMarked, AlertCircle, UserCheck, Clock, CheckCircle,
    TrendingUp, Calendar, Star, GraduationCap, User, Award, BarChart3,
    PieChart, Activity, BookText, Users2, AlertTriangle, TrendingDown, RefreshCw
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart as RechartsPieChart, Pie, Cell, AreaChart, Area, LineChart, Line,
    RadialBarChart, RadialBar, Legend
} from 'recharts';

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
    docentesFrecuentes: Array<{
        id: number;
        nombre: string;
        total_prestamos: number;
        tipo: string;
        grado: {
            grado: string;
            subGrado: string;
        } | null;
    }>;
    estudiantesFrecuentes: Array<{
        id: number;
        nombre: string;
        total_prestamos: number;
        tipo: string;
        grado: {
            grado: string;
            subGrado: string;
        } | null;
    }>;
    estadisticasGenerales: {
        total_prestamos: number;
        prestamos_activos: number;
        prestamos_vencidos: number;
        libros_reposicion: number;
        total_libros: number;
        total_lectores: number;
        total_ejemplares: number;
        total_docentes: number;
        total_estudiantes: number;
    };
    prestamosPorMes: Array<{
        mes: string;
        mes_nombre: string;
        total: number;
    }>;
    estadisticasDevolucion: {
        devueltos_tiempo: number;
        devueltos_tarde: number;
    };
    tasaDevolucionTiempo: number;
    estadisticasAdicionales: {
        promedio_prestamos_mes: number;
        libro_mas_popular: any;
        mes_mas_activo: any;
    };
    prestamosPorGrado: Array<{
        grado: string;
        total_prestamos: number;
    }>;
    distribucionLectores: Array<{
        tipo: string;
        cantidad: number;
    }>;
    yearCurrent: number;
}

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ElementType;
    trend?: boolean;
    trendValue?: string;
    colorClass: string;
    description?: string;
}

const StatCard = ({ title, value, icon: Icon, trend, trendValue, colorClass, description }: StatCardProps) => (
    <div className="relative group">
        <Card className="relative overflow-hidden bg-gradient-to-br from-white/95 via-slate-50/90 to-blue-50/80 dark:from-gray-900/95 dark:via-gray-800/90 dark:to-blue-950/80 border border-white/20 dark:border-gray-700/30 backdrop-blur-md h-24">
            <div className="absolute inset-0 opacity-40">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_25%_25%,rgba(59,130,246,0.12)_0%,transparent_50%)]"></div>
                <div className="absolute bottom-0 right-0 w-2/3 h-2/3 bg-[radial-gradient(circle_at_75%_75%,rgba(168,85,247,0.08)_0%,transparent_60%)]"></div>
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_48%,rgba(59,130,246,0.03)_50%,transparent_52%)]"></div>
            </div>
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/60 to-transparent"></div>
            <div className="absolute inset-1 rounded-lg bg-gradient-to-br from-white/30 via-white/10 to-transparent dark:from-white/5 dark:via-white/2 dark:to-transparent pointer-events-none"></div>

            <CardContent className="relative p-3 h-full flex flex-col justify-between">
                <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0 pr-2">
                        <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider leading-tight">
                            {title}
                        </h3>
                        {description && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium opacity-80 leading-tight mt-0.5">{description}</p>
                        )}
                    </div>

                    <div className="relative">
                        <div className={`relative p-2 rounded-lg ${colorClass}`}>
                            <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-white/40 via-white/20 to-transparent"></div>
                            <div className="absolute inset-0 rounded-lg bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.5)_0%,transparent_70%)]"></div>
                            <Icon className="relative h-4 w-4 text-white" />
                        </div>
                    </div>
                </div>

                <div className="flex items-end justify-between">
                    <div className="relative">
                        <div className="relative text-xl font-black bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 dark:from-white dark:via-slate-100 dark:to-slate-200 bg-clip-text text-transparent tracking-tight leading-none">
                            {typeof value === 'number' ? value.toLocaleString() : value}
                        </div>
                    </div>

                    {trend && (
                        <div className="relative">
                            <div className="relative flex items-center gap-1.5 bg-gradient-to-r from-blue-50/90 via-indigo-50/90 to-cyan-50/90 dark:from-blue-950/60 dark:via-indigo-950/60 dark:to-cyan-950/60 px-2 py-1 rounded-md border border-blue-200/50 dark:border-blue-800/30 backdrop-blur-sm">
                                <div className="p-0.5 rounded-sm bg-gradient-to-r from-blue-500 to-cyan-500">
                                    <TrendingUp className="h-2.5 w-2.5 text-white" />
                                </div>
                                <span className="text-xs font-semibold bg-gradient-to-r from-blue-700 to-cyan-700 dark:from-blue-300 dark:to-cyan-300 bg-clip-text text-transparent">
                                    {trendValue}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>

            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-slate-200/60 dark:via-slate-600/60 to-transparent"></div>
            <div className="absolute top-2 right-8 w-1 h-1 bg-blue-400/50 rounded-full"></div>
            <div className="absolute top-4 right-6 w-0.5 h-0.5 bg-purple-400/40 rounded-full"></div>
            <div className="absolute bottom-2 left-6 w-0.5 h-0.5 bg-cyan-400/40 rounded-full"></div>
        </Card>
    </div>
);

const ListCard = ({
    title,
    items,
    type,
    icon: Icon,
    emptyMessage = "No hay datos disponibles"
}: {
    title: string;
    items: Array<any>;
    type: 'books' | 'docentes' | 'estudiantes';
    icon: React.ElementType;
    emptyMessage?: string;
}) => (
    <div className="relative group">
        <Card className="relative overflow-hidden bg-gradient-to-br from-white via-slate-50/80 to-blue-50/20 dark:from-gray-900 dark:via-gray-800/90 dark:to-blue-950/20 border-0 backdrop-blur-sm">
            <div className="absolute inset-0 opacity-20">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1)_0%,transparent_50%)]"></div>
                <div className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0deg,rgba(168,85,247,0.05)_60deg,transparent_120deg)]"></div>
                <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_40%,rgba(59,130,246,0.02)_50%,transparent_60%)]"></div>
            </div>

            <CardHeader className="relative bg-gradient-to-r from-slate-50/80 via-blue-50/60 to-indigo-50/40 dark:from-gray-800/80 dark:via-blue-950/40 dark:to-indigo-950/20 px-3 py-2 border-b border-slate-200/30 dark:border-gray-700/30">
                <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(59,130,246,0.03)_50%,transparent_100%)]"></div>
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/40 to-transparent"></div>
                <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-slate-300/60 dark:via-slate-600/60 to-transparent"></div>

                <CardTitle className="relative flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-200">
                    <div className="relative">
                        <div className="relative p-1.5 rounded-lg bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-600">
                            <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-white/40 via-white/20 to-transparent"></div>
                            <div className="absolute inset-0 rounded-lg bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.4)_0%,transparent_70%)]"></div>
                            <div className="absolute inset-0 rounded-lg bg-[conic-gradient(from_45deg_at_50%_50%,transparent_0deg,rgba(255,255,255,0.1)_90deg,transparent_180deg)]"></div>
                            <Icon className="relative h-3 w-3 text-white" />
                        </div>
                        <div className="absolute -top-0.5 -right-0.5 w-1 h-1 bg-cyan-400 rounded-full"></div>
                        <div className="absolute -bottom-0.5 -left-0.5 w-0.5 h-0.5 bg-blue-300 rounded-full"></div>
                    </div>

                    <span className="bg-gradient-to-r from-slate-800 via-blue-900 to-indigo-800 dark:from-slate-200 dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent font-black tracking-tight">
                        {title}
                    </span>
                </CardTitle>
            </CardHeader>

            <CardContent className="relative p-3">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,rgba(59,130,246,0.06)_1px,transparent_0)] [background-size:20px_20px] opacity-40"></div>

                {items.length === 0 ? (
                    <div className="relative text-center py-4 text-slate-600 dark:text-slate-400">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 dark:from-gray-800 dark:via-blue-950 dark:to-indigo-950 flex items-center justify-center border border-slate-200/50 dark:border-gray-700/50">
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/30 to-transparent"></div>
                            <Icon className="relative h-6 w-6 opacity-60" />
                        </div>
                        <p className="text-sm font-semibold">{emptyMessage}</p>
                    </div>
                ) : (
                    <div className="relative space-y-1.5">
                        {items.map((item, index) => (
                            <div key={item.id} className="relative group/item">
                                <div className="relative p-2 rounded-lg bg-gradient-to-r from-slate-50/90 via-white/95 to-blue-50/70 dark:from-gray-800/60 dark:via-gray-700/80 dark:to-blue-950/40 border border-slate-200/40 dark:border-gray-600/30 backdrop-blur-sm">
                                    <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-white/50 via-transparent to-transparent dark:from-white/5"></div>
                                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>

                                    <div className="relative flex items-center gap-2">
                                        <div className="relative flex-shrink-0">
                                            <div className="relative flex items-center justify-center w-6 h-6 rounded-md bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-600 text-white font-black text-xs">
                                                <div className="absolute inset-0 rounded-md bg-gradient-to-br from-white/30 via-white/10 to-transparent"></div>
                                                <div className="absolute inset-0 rounded-md bg-[radial-gradient(circle_at_25%_25%,rgba(255,255,255,0.4)_0%,transparent_50%)]"></div>
                                                {type === 'books' ? (
                                                    <span className="relative text-sm">{index + 1}</span>
                                                ) : (
                                                    <span className="relative text-sm">{item.nombre.charAt(0).toUpperCase()}</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-slate-900 dark:text-white text-sm leading-tight">
                                                {type === 'books' ? item.titulo : item.nombre}
                                            </p>
                                            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium opacity-90 leading-tight">
                                                {type === 'books'
                                                    ? `${item.total_prestamos} préstamos`
                                                    : item.grado
                                                        ? item.grado.subGrado || ''
                                                        : type === 'docentes' ? 'Docente' : 'Estudiante'
                                                }
                                            </p>
                                        </div>

                                        <div className="relative flex-shrink-0">
                                            <div className="relative flex items-center gap-1 bg-gradient-to-r from-blue-100/90 via-indigo-100/90 to-cyan-100/90 dark:from-blue-900/60 dark:via-indigo-900/60 dark:to-cyan-900/60 px-2 py-1 rounded-md border border-blue-200/50 dark:border-blue-800/50 backdrop-blur-sm">
                                                <div className="absolute inset-0 rounded-md bg-gradient-to-br from-white/40 to-transparent dark:from-white/10"></div>
                                                <BookOpen className="relative h-2.5 w-2.5 text-blue-700 dark:text-blue-300" />
                                                <span className="relative text-xs font-black bg-gradient-to-r from-blue-800 to-indigo-800 dark:from-blue-200 dark:to-indigo-200 bg-clip-text text-transparent">
                                                    {item.total_prestamos} préstamos
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>

            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-slate-300/50 dark:via-slate-600/50 to-transparent"></div>
            <div className="absolute bottom-1 right-2 w-0.5 h-0.5 bg-blue-400/50 rounded-full"></div>
            <div className="absolute bottom-2 right-3 w-0.5 h-0.5 bg-purple-400/30 rounded-full"></div>
        </Card>
    </div>
);

export default function Dashboard({
    librosMasPrestados,
    docentesFrecuentes,
    estudiantesFrecuentes,
    estadisticasGenerales,
    prestamosPorMes,
    estadisticasDevolucion,
    tasaDevolucionTiempo,
    estadisticasAdicionales,
    prestamosPorGrado,
    distribucionLectores,
    yearCurrent
}: DashboardProps) {

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Dashboard ${yearCurrent}`} />

            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-8">
                        <div className="flex justify-between items-center">
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                Biblioteca Madre Caridad
                            </h1>

                            <div className="flex items-center gap-3 bg-white dark:bg-gray-800 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700">
                                <div className="p-1.5 rounded-lg bg-blue-600 text-white">
                                    <Calendar className="h-4 w-4" />
                                </div>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {new Date().toLocaleDateString('es-ES', {
                                        weekday: 'long',
                                        day: 'numeric',
                                        month: 'long'
                                    })}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <StatCard title="Total Préstamos" value={estadisticasGenerales.total_prestamos} icon={BookOpen} trend={false} colorClass="bg-blue-600" description={`Año ${yearCurrent}`} />
                            <StatCard title="Préstamos Activos" value={estadisticasGenerales.prestamos_activos} icon={BookMarked} trend={false} colorClass="bg-emerald-600" />
                            <StatCard title="Préstamos Vencidos" value={estadisticasGenerales.prestamos_vencidos} icon={AlertTriangle} trend={false} colorClass="bg-rose-600" />
                            <StatCard 
                                title="Libros Repuestos" 
                                value={estadisticasGenerales.libros_reposicion} 
                                icon={RefreshCw} 
                                trend={estadisticasGenerales.libros_reposicion === 0} 
                                trendValue={estadisticasGenerales.libros_reposicion === 0 ? "Perfecto" : "Requiere atención"} 
                                colorClass="bg-orange-600" 
                            />
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <StatCard title="Total Libros" value={estadisticasGenerales.total_libros} icon={BookText} colorClass="bg-purple-600" />
                            <StatCard title="Total Ejemplares" value={estadisticasGenerales.total_ejemplares} icon={BookOpen} colorClass="bg-amber-600" />
                            <StatCard title="Docentes" value={estadisticasGenerales.total_docentes} icon={GraduationCap} colorClass="bg-teal-600" />
                            <StatCard title="Estudiantes" value={estadisticasGenerales.total_estudiantes} icon={Users2} colorClass="bg-pink-600" />
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                            <Card className="bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50">
                                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/30 to-transparent" />

                                <CardHeader className="bg-gray-50/50 dark:bg-gray-700/50 px-4 py-3 border-b border-gray-200/50 dark:border-gray-600/50">
                                    <CardTitle className="relative flex items-center gap-3 text-sm font-bold text-slate-800 dark:text-slate-200">
                                        <div className="relative">
                                            <div className="relative p-2 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600">
                                                <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-white/40 via-white/20 to-transparent"></div>
                                                <BarChart3 className="relative h-4 w-4 text-white" />
                                            </div>
                                        </div>
                                        <span className="bg-gradient-to-r from-slate-800 via-blue-900 to-indigo-800 dark:from-slate-200 dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent font-black tracking-tight">
                                            Préstamos por Mes - {yearCurrent}
                                        </span>
                                    </CardTitle>
                                </CardHeader>

                                <CardContent className="p-4">
                                    <div className="h-64">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={prestamosPorMes}>
                                                <defs>
                                                    <linearGradient id="colorPrestamos" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.6} />
                                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                                                <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                                                <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }} />
                                                <Area type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} fill="url(#colorPrestamos)" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="relative overflow-hidden bg-gradient-to-br from-white/95 via-slate-50/90 to-blue-50/80 dark:from-gray-900/95 dark:via-gray-800/90 dark:to-blue-950/80 border border-white/20 dark:border-gray-700/30 backdrop-blur-md">
                                <div className="absolute inset-0 opacity-40">
                                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_25%_25%,rgba(59,130,246,0.12)_0%,transparent_50%)]"></div>
                                    <div className="absolute bottom-0 right-0 w-2/3 h-2/3 bg-[radial-gradient(circle_at_75%_75%,rgba(168,85,247,0.08)_0%,transparent_60%)]"></div>
                                </div>
                                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/60 to-transparent"></div>

                                <CardHeader className="relative bg-gradient-to-r from-slate-50/80 via-blue-50/70 to-indigo-50/60 dark:from-gray-800/80 dark:via-blue-950/50 dark:to-indigo-950/30 px-4 py-3 border-b border-blue-200/30 dark:border-blue-700/30">
                                    <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(59,130,246,0.08)_50%,transparent_100%)]"></div>
                                    <CardTitle className="relative flex items-center gap-3 text-sm font-bold text-slate-800 dark:text-slate-200">
                                        <div className="relative">
                                            <div className="relative p-2 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600">
                                                <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-white/40 via-white/20 to-transparent"></div>
                                                <PieChart className="relative h-4 w-4 text-white" />
                                            </div>
                                        </div>
                                        <span className="bg-gradient-to-r from-slate-800 via-blue-900 to-indigo-800 dark:from-slate-200 dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent font-black tracking-tight">
                                            Distribución de Lectores por Tipo
                                        </span>
                                    </CardTitle>
                                </CardHeader>

                                <CardContent className="relative p-4">
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,rgba(59,130,246,0.06)_1px,transparent_0)] [background-size:20px_20px] opacity-30"></div>

                                    <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <div className="flex items-center justify-center">
                                            <div className="relative">
                                                <ResponsiveContainer width={200} height={200}>
                                                    <RechartsPieChart>
                                                        <defs>
                                                            <linearGradient id="docentesGradMejorado" x1="0" y1="0" x2="1" y2="1">
                                                                <stop offset="0%" stopColor="#3b82f6" />
                                                                <stop offset="100%" stopColor="#6366f1" />
                                                            </linearGradient>
                                                            <linearGradient id="estudiantesGradMejorado" x1="0" y1="0" x2="1" y2="1">
                                                                <stop offset="0%" stopColor="#10b981" />
                                                                <stop offset="100%" stopColor="#059669" />
                                                            </linearGradient>
                                                        </defs>
                                                        <Pie
                                                            data={distribucionLectores.map(item => ({
                                                                ...item,
                                                                nombre: item.tipo === 'Docentes' ? 'Docentes' : 'Estudiantes',
                                                                porcentaje: Math.round((item.cantidad / distribucionLectores.reduce((sum, i) => sum + i.cantidad, 0)) * 100)
                                                            }))}
                                                            cx="50%"
                                                            cy="50%"
                                                            innerRadius={30}
                                                            outerRadius={80}
                                                            paddingAngle={2}
                                                            dataKey="cantidad"
                                                            nameKey="nombre"
                                                            label={({ nombre, porcentaje, cantidad }) => `${nombre}: ${cantidad} (${porcentaje}%)`}
                                                            labelLine={false}
                                                        >
                                                            {distribucionLectores.map((entry, index) => (
                                                                <Cell
                                                                    key={`cell-${index}`}
                                                                    fill={index === 0 ? 'url(#docentesGradMejorado)' : 'url(#estudiantesGradMejorado)'}
                                                                />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip
                                                            contentStyle={{
                                                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                                                border: '1px solid rgba(59, 130, 246, 0.2)',
                                                                borderRadius: '12px',
                                                                fontSize: '12px',
                                                                fontWeight: '600',
                                                                backdropFilter: 'blur(8px)',
                                                                color: '#1e40af'
                                                            }}
                                                            formatter={(value: number, name: string) => {
                                                                const total = distribucionLectores.reduce((sum, item) => sum + item.cantidad, 0);
                                                                const porcentaje = Math.round((value / total) * 100);
                                                                return [
                                                                    `${value.toLocaleString()} personas (${porcentaje}%)`,
                                                                    name
                                                                ];
                                                            }}
                                                        />
                                                    </RechartsPieChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            {distribucionLectores.map((item, index) => {
                                                const total = distribucionLectores.reduce((sum, i) => sum + i.cantidad, 0);
                                                const porcentaje = Math.round((item.cantidad / total) * 100);
                                                const esDocente = item.tipo === 'Docentes';

                                                return (
                                                    <div key={index} className="relative">
                                                        <div className={`relative p-4 rounded-xl ${esDocente
                                                            ? 'bg-gradient-to-r from-blue-50/90 via-indigo-50/90 to-blue-50/90 dark:from-blue-950/60 dark:via-indigo-950/60 dark:to-blue-950/60 border border-blue-200/50 dark:border-blue-800/30'
                                                            : 'bg-gradient-to-r from-emerald-50/90 via-green-50/90 to-emerald-50/90 dark:from-emerald-950/60 dark:via-green-950/60 dark:to-emerald-950/60 border border-emerald-200/50 dark:border-emerald-800/30'
                                                            } backdrop-blur-sm`}>
                                                            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/40 to-transparent dark:from-white/10"></div>

                                                            <div className="relative flex items-center justify-between">
                                                                <div className="flex items-center gap-3">
                                                                    <div className={`p-2 rounded-lg ${esDocente ? 'bg-gradient-to-br from-blue-500 to-indigo-500' : 'bg-gradient-to-br from-emerald-500 to-green-500'} text-white`}>
                                                                        {esDocente ? <GraduationCap className="h-4 w-4" /> : <Users2 className="h-4 w-4" />}
                                                                    </div>
                                                                    <div>
                                                                        <h4 className={`font-bold text-sm ${esDocente ? 'text-blue-800 dark:text-blue-200' : 'text-emerald-800 dark:text-emerald-200'}`}>
                                                                            {item.tipo}
                                                                        </h4>
                                                                        <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                                                                            {porcentaje}% del total
                                                                        </p>
                                                                    </div>
                                                                </div>

                                                                <div className="text-right">
                                                                    <div className={`text-lg font-black ${esDocente ? 'text-blue-600' : 'text-emerald-600'}`}>
                                                                        {item.cantidad.toLocaleString()}
                                                                    </div>
                                                                    <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                                                        personas
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="mt-3">
                                                                <div className="w-full bg-gray-200/50 dark:bg-gray-700/50 rounded-full h-2">
                                                                    <div
                                                                        className={`h-2 rounded-full ${esDocente
                                                                            ? 'bg-gradient-to-r from-blue-500 to-indigo-500'
                                                                            : 'bg-gradient-to-r from-emerald-500 to-green-500'
                                                                            }`}
                                                                        style={{ width: `${porcentaje}%` }}
                                                                    ></div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </CardContent>

                                <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-slate-200/60 dark:via-slate-600/60 to-transparent"></div>
                            </Card>
                        </div>

                        <Card className="relative overflow-hidden bg-gradient-to-br from-white/95 via-slate-50/90 to-blue-50/80 dark:from-gray-900/95 dark:via-gray-800/90 dark:to-blue-950/80 border border-white/20 dark:border-gray-700/30 backdrop-blur-md">
                            <div className="absolute inset-0 opacity-40">
                                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_25%_25%,rgba(59,130,246,0.12)_0%,transparent_50%)]"></div>
                                <div className="absolute bottom-0 right-0 w-2/3 h-2/3 bg-[radial-gradient(circle_at_75%_75%,rgba(168,85,247,0.08)_0%,transparent_60%)]"></div>
                                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_48%,rgba(59,130,246,0.03)_50%,transparent_52%)]"></div>
                            </div>
                            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/60 to-transparent"></div>

                            <CardHeader className="relative bg-gradient-to-r from-slate-50/80 via-blue-50/70 to-indigo-50/60 dark:from-gray-800/80 dark:via-blue-950/50 dark:to-indigo-950/30 px-4 py-3 border-b border-blue-200/30 dark:border-blue-700/30">
                                <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(59,130,246,0.08)_50%,transparent_100%)]"></div>
                                <CardTitle className="relative flex items-center gap-3 text-sm font-bold text-slate-800 dark:text-slate-200">
                                    <div className="relative">
                                        <div className="relative p-2 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600">
                                            <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-white/40 via-white/20 to-transparent"></div>
                                            <CheckCircle className="relative h-4 w-4 text-white" />
                                        </div>
                                    </div>
                                    <span className="bg-gradient-to-r from-slate-800 via-blue-900 to-indigo-800 dark:from-slate-200 dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent font-black tracking-tight">
                                        Estado de Devoluciones - {yearCurrent}
                                    </span>
                                </CardTitle>
                            </CardHeader>

                            <CardContent className="relative p-6">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,rgba(59,130,246,0.06)_1px,transparent_0)] [background-size:20px_20px] opacity-30"></div>

                                <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <div className="flex flex-col items-center justify-center space-y-6">
                                        <div className="relative">
                                            <div className="relative w-36 h-36">
                                                <svg className="relative w-full h-full -rotate-90" viewBox="0 0 100 100">
                                                    <defs>
                                                        <linearGradient id="successGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                                            <stop offset="0%" stopColor="#3b82f6" />
                                                            <stop offset="30%" stopColor="#2563eb" />
                                                            <stop offset="70%" stopColor="#1d4ed8" />
                                                            <stop offset="100%" stopColor="#1e40af" />
                                                        </linearGradient>
                                                        <linearGradient id="trackGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                                            <stop offset="0%" stopColor="rgba(148, 163, 184, 0.15)" />
                                                            <stop offset="50%" stopColor="rgba(148, 163, 184, 0.25)" />
                                                            <stop offset="100%" stopColor="rgba(148, 163, 184, 0.15)" />
                                                        </linearGradient>
                                                    </defs>

                                                    <circle cx="50" cy="50" r="38" fill="none" stroke="url(#trackGradient)" strokeWidth="6" />
                                                    <circle cx="50" cy="50" r="32" fill="none" stroke="rgba(59, 130, 246, 0.08)" strokeWidth="1" />
                                                    <circle cx="50" cy="50" r="38" fill="none" stroke="url(#successGradient)" strokeWidth="6" strokeLinecap="round" strokeDasharray={`${(tasaDevolucionTiempo * 238.76) / 100} 238.76`} className="transition-all duration-1500 ease-out" />
                                                    <circle cx="50" cy="12" r="1.5" fill="rgba(59, 130, 246, 0.4)" />
                                                    <circle cx="88" cy="50" r="1.5" fill="rgba(59, 130, 246, 0.3)" />
                                                    <circle cx="50" cy="88" r="1.5" fill="rgba(59, 130, 246, 0.2)" />
                                                </svg>

                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="text-center relative">
                                                        <div className="absolute inset-0 bg-white/40 dark:bg-gray-900/40 rounded-full scale-150"></div>
                                                        <div className="relative">
                                                            <div className="text-3xl font-black bg-gradient-to-b from-blue-600 via-blue-700 to-indigo-700 bg-clip-text text-transparent">
                                                                {Number(tasaDevolucionTiempo).toFixed(2)}%
                                                            </div>
                                                            <div className="text-xs text-blue-700 dark:text-blue-300 font-bold mt-1 tracking-wide">
                                                                Tasa de éxito
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div
                                                    className="absolute w-3 h-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full border-2 border-white dark:border-gray-900 transition-all duration-1500 ease-out"
                                                    style={{
                                                        top: '18px',
                                                        left: '50%',
                                                        transform: `translate(-50%, -50%) rotate(${(tasaDevolucionTiempo * 360) / 100}deg) translateY(-38px)`,
                                                        transformOrigin: '50% 38px'
                                                    }}
                                                ></div>
                                            </div>
                                        </div>

                                        <div className="w-full max-w-sm space-y-4">
                                            <div className="relative group">
                                                <div className="relative p-4 rounded-xl bg-gradient-to-br from-blue-50/95 via-blue-100/90 to-blue-50/95 dark:from-blue-950/70 dark:via-blue-900/70 dark:to-blue-950/70 border border-blue-200/60 dark:border-blue-800/40 backdrop-blur-sm">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="relative">
                                                                <div className="relative p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                                                                    <CheckCircle className="h-3.5 w-3.5" />
                                                                </div>
                                                            </div>
                                                            <span className="font-bold text-blue-800 dark:text-blue-200 text-sm">Devueltos a tiempo</span>
                                                        </div>
                                                        <span className="text-xl font-black bg-gradient-to-br from-blue-600 to-blue-700 bg-clip-text text-transparent">
                                                            {estadisticasDevolucion.devueltos_tiempo}
                                                        </span>
                                                    </div>

                                                    <div className="relative">
                                                        <div className="w-full bg-blue-200/60 dark:bg-blue-900/40 rounded-full h-2.5">
                                                            <div
                                                                className="h-2.5 rounded-full bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 transition-all duration-1200 ease-out relative overflow-hidden"
                                                                style={{ width: `${tasaDevolucionTiempo}%` }}
                                                            >
                                                                <div className="absolute inset-0 bg-gradient-to-r from-white/30 via-white/10 to-transparent rounded-full"></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="relative group">
                                                <div className="relative p-4 rounded-xl bg-gradient-to-br from-amber-50/95 via-orange-50/90 to-amber-50/95 dark:from-amber-950/70 dark:via-orange-950/70 dark:to-amber-950/70 border border-amber-200/60 dark:border-amber-800/40 backdrop-blur-sm">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="relative">
                                                                <div className="relative p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 text-white">
                                                                    <Clock className="h-3.5 w-3.5" />
                                                                </div>
                                                            </div>
                                                            <span className="font-bold text-amber-800 dark:text-amber-200 text-sm">Con retraso</span>
                                                        </div>
                                                        <span className="text-xl font-black bg-gradient-to-br from-amber-600 to-orange-600 bg-clip-text text-transparent">
                                                            {estadisticasDevolucion.devueltos_tarde}
                                                        </span>
                                                    </div>

                                                    <div className="relative">
                                                        <div className="w-full bg-amber-200/60 dark:bg-amber-900/40 rounded-full h-2.5">
                                                            <div
                                                                className="h-2.5 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 transition-all duration-1200 ease-out relative overflow-hidden"
                                                                style={{ width: `${100 - tasaDevolucionTiempo}%` }}
                                                            >
                                                                <div className="absolute inset-0 bg-gradient-to-r from-white/30 via-white/10 to-transparent rounded-full"></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="relative group">
                                            <div className="relative p-5 rounded-xl bg-gradient-to-br from-blue-50/95 via-indigo-50/90 to-blue-50/95 dark:from-blue-950/70 dark:via-indigo-950/70 dark:to-blue-950/70 border border-blue-200/60 dark:border-blue-800/40 backdrop-blur-sm">
                                                <h3 className="font-bold text-blue-800 dark:text-blue-200 text-sm mb-4 flex items-center gap-2">
                                                    <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 text-white">
                                                        <BarChart3 className="h-3.5 w-3.5" />
                                                    </div>
                                                    Resumen del Año {yearCurrent}
                                                </h3>

                                                <div className="grid grid-cols-2 gap-6">
                                                    <div className="text-center relative">
                                                        <div className="absolute inset-0 bg-blue-500/5 rounded-lg -m-2"></div>
                                                        <div className="relative">
                                                            <div className="text-2xl font-black bg-gradient-to-br from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                                                {estadisticasDevolucion.devueltos_tiempo + estadisticasDevolucion.devueltos_tarde}
                                                            </div>
                                                            <div className="text-xs text-blue-700 dark:text-blue-300 font-medium mt-1">
                                                                Total devueltos
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="text-center relative">
                                                        <div className="absolute inset-0 bg-indigo-500/5 rounded-lg -m-2"></div>
                                                        <div className="relative">
                                                            <div className="text-2xl font-black bg-gradient-to-br from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                                                {tasaDevolucionTiempo >= 80 ? 'Excelente' : tasaDevolucionTiempo >= 60 ? 'Bueno' : 'Regular'}
                                                            </div>
                                                            <div className="text-xs text-indigo-700 dark:text-indigo-300 font-medium mt-1">
                                                                Evaluación
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-3">
                                            <div className="relative group">
                                                <div className="relative p-4 rounded-lg bg-white/95 dark:bg-gray-800/95 border border-blue-200/60 dark:border-blue-800/40 backdrop-blur-sm">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Porcentaje a tiempo</span>
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600"></div>
                                                            <span className="text-sm font-black text-blue-600">{Number(tasaDevolucionTiempo).toFixed(2)}%</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="relative group">
                                                <div className="relative p-4 rounded-lg bg-white/95 dark:bg-gray-800/95 border border-amber-200/60 dark:border-amber-800/40 backdrop-blur-sm">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Porcentaje con retraso</span>
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500"></div>
                                                            <span className="text-sm font-black text-amber-600">{(100 - tasaDevolucionTiempo).toFixed(2)}%</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {tasaDevolucionTiempo >= 75 && (
                                            <div className="relative group">
                                                <div className="relative p-4 rounded-xl bg-gradient-to-br from-emerald-100/95 to-green-100/95 dark:from-emerald-900/50 dark:to-green-900/50 border border-emerald-300/60 dark:border-emerald-700/60 backdrop-blur-sm">
                                                    <div className="flex items-center gap-3">
                                                        <div className="relative">
                                                            <div className="relative p-2 rounded-lg bg-emerald-500 text-white">
                                                                <TrendingUp className="h-3.5 w-3.5" />
                                                            </div>
                                                        </div>
                                                        <span className="text-sm font-bold text-emerald-800 dark:text-emerald-200">
                                                            ¡Excelente gestión de préstamos!
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>

                            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-slate-200/60 dark:via-slate-600/60 to-transparent"></div>
                        </Card>

                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                            <ListCard title="Libros Más Prestados" items={librosMasPrestados} type="books" icon={Star} emptyMessage="No hay préstamos registrados este año" />
                            <ListCard title="Docentes Frecuentes" items={docentesFrecuentes} type="docentes" icon={GraduationCap} emptyMessage="No hay préstamos de docentes este año" />
                            <ListCard title="🎓 Estudiantes Frecuentes" items={estudiantesFrecuentes} type="estudiantes" icon={Users2} emptyMessage="No hay préstamos de estudiantes este año" />
                        </div>

                        {estadisticasAdicionales?.libro_mas_popular && (
                            <Card className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200/50 dark:border-amber-800/50">
                                <CardContent className="p-3">
                                    <div className="flex items-center gap-3">
                                        <div className="flex-shrink-0">
                                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                                                <Award className="h-5 w-5 text-white" />
                                            </div>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-0.5">
                                                📖 Libro Más Popular del Año
                                            </h3>
                                            <p className="text-sm font-semibold text-amber-700 dark:text-amber-300 mb-0.5">
                                                "{estadisticasAdicionales.libro_mas_popular.titulo}"
                                            </p>
                                            <p className="text-gray-600 dark:text-gray-400 text-xs">
                                                Con {estadisticasAdicionales.libro_mas_popular.total_prestamos} préstamos realizados
                                            </p>
                                        </div>

                                        <div className="flex-shrink-0">
                                            <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white px-2.5 py-1.5 rounded-lg">
                                                <div className="text-lg font-bold leading-none">#1</div>
                                                <div className="text-xs opacity-90 font-medium leading-none">Ranking</div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}