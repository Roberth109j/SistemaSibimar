import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle, Mail, Lock, LogIn, EyeOff, Eye, Home } from 'lucide-react';
import { FormEventHandler, useState, useEffect } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type LoginForm = {
    email: string;
    password: string;
    remember: boolean;
};

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
    error?: string;
}

export default function Login({ status, canResetPassword, error }: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm<Required<LoginForm>>({
        email: '',
        password: '',
        remember: false,
    });

    const [showPassword, setShowPassword] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [errorVisible, setErrorVisible] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Efecto para manejar la visibilidad de los errores
    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            setErrorVisible(true);
            const timer = setTimeout(() => {
                setErrorVisible(false);
            }, 5000); // Ocultar después de 5 segundos
            
            return () => clearTimeout(timer);
        }
    }, [errors]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    return (
        <>
            <Head title="Iniciar sesión" />

            <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-white dark:bg-gray-900 bg-gradient-animate">
                {/* Fondo con degradado igual al original */}
                <div className="absolute inset-0 bg-gradient-to-br from-white via-blue-50/30 to-white dark:opacity-0 opacity-90"></div>
                
                {/* Ondas SVG más curvas en la parte superior e inferior, más difuminadas en oscuro */}
                <div className="absolute inset-0 w-full h-full overflow-hidden">
                    <div className="absolute inset-0">
                        {/* Ondas superiores más curvas y menos visibles en oscuro */}
                        <svg className="absolute w-full h-1/3 opacity-20 dark:opacity-10" viewBox="0 0 1440 420" preserveAspectRatio="none">
                            <path fill="currentColor" className="text-blue-300 dark:text-white/40" d="M0,160C120,240,240,280,360,266.7C480,253,600,187,720,160C840,133,960,147,1080,160C1200,173,1320,187,1380,193.3L1440,200L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z"></path>
                        </svg>
                        <svg className="absolute w-full h-1/4 opacity-15 dark:opacity-8 top-0" viewBox="0 0 1440 320" preserveAspectRatio="none">
                            <path fill="currentColor" className="text-blue-200 dark:text-white/30" d="M0,96C48,128,96,160,192,160C288,160,384,128,480,122.7C576,117,672,139,768,138.7C864,139,960,117,1056,106.7C1152,96,1248,96,1344,106.7C1392,112,1416,117,1428,120L1440,123L1440,0L1428,0C1416,0,1392,0,1344,0C1248,0,1152,0,1056,0C960,0,864,0,768,0C672,0,576,0,480,0C384,0,288,0,192,0C96,0,48,0,24,0L0,0Z"></path>
                        </svg>
                        
                        {/* Ondas inferiores más curvas y menos visibles en oscuro */}
                        <svg className="absolute w-full bottom-0 opacity-18 dark:opacity-8" height="280" viewBox="0 0 1440 280" preserveAspectRatio="none">
                            <path fill="currentColor" className="text-blue-400 dark:text-white/40" d="M0,224C60,213,120,203,240,203C360,203,480,213,600,202.7C720,192,840,160,960,154.7C1080,149,1200,171,1320,176C1380,179,1410,181,1425,184L1440,187L1440,320L1425,320C1410,320,1380,320,1320,320C1200,320,1080,320,960,320C840,320,720,320,600,320C480,320,360,320,240,320C120,320,60,320,30,320L0,320Z"></path>
                        </svg>
                        <svg className="absolute w-full bottom-0 opacity-15 dark:opacity-6" height="220" viewBox="0 0 1440 220" preserveAspectRatio="none">
                            <path fill="currentColor" className="text-blue-300 dark:text-white/30" d="M0,176C48,160,96,144,192,144C288,144,384,160,480,160C576,160,672,144,768,138.7C864,133,960,139,1056,144C1152,149,1248,155,1344,154.7C1392,155,1416,154,1428,154L1440,153L1440,320L1428,320C1416,320,1392,320,1344,320C1248,320,1152,320,1056,320C960,320,864,320,768,320C672,320,576,320,480,320C384,320,288,320,192,320C96,320,48,320,24,320L0,320Z"></path>
                        </svg>
                    </div>
                </div>

                {/* Patrón de puntos más visible en claro */}
                <div className="absolute inset-0 bg-repeat opacity-10 dark:opacity-10" style={{ 
                    backgroundImage: 'radial-gradient(#4285F4 1px, transparent 1px)', 
                    backgroundSize: '30px 30px' 
                }}></div>

                <div className="relative z-10 px-4 w-full max-w-md">
                    <div className="flex flex-col items-center">
                        {/* Encabezado con diseño mejorado */}
                        <div className="text-center mb-5">
                            <h1 className="text-3xl font-bold text-gray-900 tracking-tight dark:text-white drop-shadow-sm">
                                Biblioteca Madre Caridad
                            </h1>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                                Colegio Liceo de la Merced Maridiaz Franciscanas
                            </p>
                            <div className="flex items-center justify-center gap-2 mt-3">
                                <div className="h-1 w-8 bg-blue-200 dark:bg-blue-700 rounded-full"></div>
                                <div className="h-1 w-14 bg-blue-300 dark:bg-blue-500 rounded-full"></div>
                                <div className="h-1 w-8 bg-blue-200 dark:bg-blue-700 rounded-full"></div>
                            </div>
                        </div>

                        {/* Escudo - tamaño reducido y sin líneas */}
                        <div className="mb-6 relative">
                            <img
                                src="/IMG/escudo.png"
                                alt="Escudo"
                                className="h-28 filter drop-shadow-xl"
                            />
                        </div>

                        {/* Formulario con esquinas limpias, sin decoraciones azules */}
                        <form
                            onSubmit={submit}
                            className="w-full bg-white backdrop-blur-md p-6 rounded-lg shadow-lg border border-gray-200 flex flex-col gap-5 dark:bg-gray-800/95 dark:border-gray-700/50 relative overflow-hidden"
                        >

                            {/* Email */}
                            <div className="grid gap-1.5 relative">
                                <Label htmlFor="email" className="text-gray-800 font-medium text-sm flex items-center gap-1.5 dark:text-gray-200">
                                    <Mail className="h-4 w-4" />
                                    Correo electrónico
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="email"
                                        type="email"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="correo@ejemplo.com"
                                        className="bg-gray-50 text-gray-800 pl-3 pr-3 py-2 text-sm rounded-md border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 dark:bg-gray-700/50 dark:text-gray-100 dark:border-gray-600 dark:placeholder-gray-500"
                                    />
                                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-blue-200 dark:bg-blue-700 rounded-r-md opacity-50"></div>
                                </div>
                                {errorVisible && <InputError message={errors.email} />}
                            </div>

                            {/* Password */}
                            <div className="grid gap-1.5 relative">
                                <Label htmlFor="password" className="text-gray-800 font-medium text-sm flex items-center gap-1.5 dark:text-gray-200">
                                    <Lock className="h-4 w-4" />
                                    Contraseña
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        tabIndex={2}
                                        autoComplete="current-password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="••••••••"
                                        className="bg-gray-50 text-gray-800 pl-3 pr-10 py-2 text-sm rounded-md border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 dark:bg-gray-700/50 dark:text-gray-100 dark:border-gray-600 dark:placeholder-gray-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={toggleShowPassword}
                                        className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 dark:text-gray-300"
                                        tabIndex={-1}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-blue-200 dark:bg-blue-700 rounded-r-md opacity-50"></div>
                                </div>
                                {errorVisible && <InputError message={errors.password} />}
                            </div>

                            {/* Recordarme y Olvidé contraseña */}
                            <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="remember"
                                        checked={data.remember}
                                        onCheckedChange={(checked) => setData('remember', !!checked)}
                                    />
                                    <Label htmlFor="remember" className="text-xs text-gray-600 dark:text-gray-300">
                                        Recordarme
                                    </Label>
                                </div>
                                {canResetPassword && (
                                    <TextLink href={route('password.request')} className="text-xs text-blue-600 hover:underline dark:text-blue-400">
                                        ¿Olvidaste tu contraseña?
                                    </TextLink>
                                )}
                            </div>

                            {/* Separador con diseño mejorado */}
                            <div className="flex items-center gap-3 my-1">
                                <div className="h-px bg-gray-200 dark:bg-gray-700 flex-grow"></div>
                                <div className="h-2 w-2 rounded-full bg-blue-300 dark:bg-blue-600"></div>
                                <div className="h-px bg-gray-200 dark:bg-gray-700 flex-grow"></div>
                            </div>

                            {/* Botón de login - color azul en modo claro */}
                            <Button 
                                type="submit" 
                                disabled={processing} 
                                className="w-full flex items-center justify-center gap-2 text-sm font-medium bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
                            >
                                {processing ? <LoaderCircle className="animate-spin w-4 h-4" /> : <LogIn className="w-4 h-4" />}
                                Iniciar sesión
                            </Button>

                            {/* Mensaje de estado */}
                            {status && (
                                <div className="text-xs text-green-500 dark:text-green-400 text-center mt-1">
                                    {status}
                                </div>
                            )}
                            
                            {/* Mensaje de error de sesión */}
                            {error && (
                                <div className="text-xs text-red-500 dark:text-red-400 text-center mt-1 p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
                                    {error}
                                </div>
                            )}
                        </form>

                        {/* Link para volver al inicio */}
                        <div className="mt-5 text-center">
                            <TextLink
                                href={route('home')}
                                className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
                            >
                                <Home size={16} />
                                Volver al inicio
                            </TextLink>
                        </div>

                        {/* Footer */}
                        <div className="mt-6 text-xs text-gray-400 dark:text-gray-500 text-center">
                            <p>© {new Date().getFullYear()} Biblioteca Madre Caridad</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}