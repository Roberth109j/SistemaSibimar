import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Users, BookMarked, AlertCircle, UserCheck, Clock, CheckCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

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
    }>;
    estadisticasGenerales: {
        total_prestamos: number;
        prestamos_activos: number;
        prestamos_vencidos: number;
        total_libros: number;
        total_lectores: number;
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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function Dashboard({ 
    librosMasPrestados, 
    lectoresFrecuentes, 
    estadisticasGenerales,
    prestamosPorMes,
    estadisticasDevolucion,
    tasaDevolucionTiempo
}: DashboardProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Préstamos</CardTitle>
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{estadisticasGenerales.total_prestamos}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Préstamos Activos</CardTitle>
                            <BookMarked className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{estadisticasGenerales.prestamos_activos}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Préstamos Vencidos</CardTitle>
                            <AlertCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{estadisticasGenerales.prestamos_vencidos}</div>
                        </CardContent>
                    </Card>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Libros Más Prestados</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {librosMasPrestados.map((libro) => (
                                    <div key={libro.id} className="flex items-center">
                                        <BookOpen className="mr-2 h-4 w-4" />
                                        <div className="flex-1 space-y-1">
                                            <p className="text-sm font-medium leading-none">{libro.titulo}</p>
                                            <p className="text-sm text-muted-foreground">{libro.total_prestamos} préstamos</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Lectores Frecuentes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {lectoresFrecuentes.map((lector) => (
                                    <div key={lector.id} className="flex items-center">
                                        <UserCheck className="mr-2 h-4 w-4" />
                                        <div className="flex-1 space-y-1">
                                            <p className="text-sm font-medium leading-none">{lector.nombre}</p>
                                            <p className="text-sm text-muted-foreground">{lector.total_prestamos} préstamos</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Préstamos por Mes</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={prestamosPorMes}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="mes" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="total" fill="#8884d8" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Estadísticas de Devolución</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <div className="flex flex-col items-center justify-center h-full">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="text-4xl font-bold">{tasaDevolucionTiempo}%</div>
                                    <div className="text-sm text-muted-foreground">devoluciones a tiempo</div>
                                </div>
                                <div className="w-full grid grid-cols-2 gap-4 mb-4">
                                    <div className="flex flex-col items-center">
                                        <div className="text-2xl font-bold text-green-600">
                                            {estadisticasDevolucion.devueltos_tiempo}
                                        </div>
                                        <div className="text-sm text-muted-foreground">A tiempo</div>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <div className="text-2xl font-bold text-red-600">
                                            {estadisticasDevolucion.devueltos_tarde}
                                        </div>
                                        <div className="text-sm text-muted-foreground">Con retraso</div>
                                    </div>
                                </div>
                                <ResponsiveContainer width="100%" height="50%">
                                    <PieChart>
                                        <Pie
                                            data={[
                                                { name: 'A tiempo', value: estadisticasDevolucion.devueltos_tiempo },
                                                { name: 'Con retraso', value: estadisticasDevolucion.devueltos_tarde }
                                            ]}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={40}
                                            outerRadius={60}
                                            fill="#8884d8"
                                            dataKey="value"
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        >
                                            <Cell fill="#4CAF50" />
                                            <Cell fill="#f44336" />
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
