import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect } from 'react';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    // Animaciones onload
    useEffect(() => {
        const styleSheet = document.createElement("style");
        styleSheet.innerHTML = `
            .img-hover-container:hover .img-hover-effect {
                transform: scale(1.08);
                filter: brightness(1.2) contrast(1.1);
                box-shadow: 0 0 20px rgba(10, 47, 108, 0.5);
            }

            .img-hover-effect {
                transition: transform 0.6s ease, filter 0.6s ease, box-shadow 0.6s ease;
            }

            @keyframes slideInDown {
                from { transform: translateY(-100%); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }

            @keyframes slideInUp {
                from { transform: translateY(100%); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }

            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }

            @keyframes shimmer {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(100%); }
            }

            @keyframes pulse-glow {
                0%, 100% { box-shadow: 0 0 5px rgba(255, 255, 255, 0.3); }
                50% { box-shadow: 0 0 20px rgba(255, 255, 255, 0.6), 0 0 30px rgba(255, 255, 255, 0.3); }
            }

            @keyframes float {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-2px); }
            }

            .modern-button {
                position: relative;
                overflow: hidden;
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.2);
                transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            }

            .modern-button::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
                transition: left 0.6s ease;
            }

            .modern-button:hover::before {
                left: 100%;
            }

            .modern-button:hover {
                transform: translateY(-3px);
                box-shadow: 0 12px 25px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.1);
            }

            .modern-button:active {
                transform: translateY(-1px);
                transition: all 0.1s ease;
            }

            .button-icon {
                transition: all 0.3s ease;
            }

            .modern-button:hover .button-icon {
                transform: scale(1.2) rotate(5deg);
            }

            .glass-effect {
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.2);
            }

            .header-animation { animation: slideInDown 1.2s ease-out forwards; }
            .footer-animation { animation: slideInUp 1.2s ease-out forwards; }
            .contact-animation { opacity: 0; animation: fadeIn 1s ease-out forwards; }

            .floating-animation {
                animation: float 3s ease-in-out infinite;
            }

            .search-button {
                background: linear-gradient(135deg, #0a2f6c 0%, #1e40af 50%, #2563eb 100%);
                position: relative;
            }

            .search-button::after {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%, rgba(255, 255, 255, 0.1) 100%);
                opacity: 0;
                transition: opacity 0.3s ease;
            }

            .search-button:hover::after {
                opacity: 1;
            }

            .dashboard-button {
                background: linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%);
                position: relative;
            }

            .dashboard-button::after {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%, rgba(255, 255, 255, 0.1) 100%);
                opacity: 0;
                transition: opacity 0.3s ease;
            }

            .dashboard-button:hover::after {
                opacity: 1;
            }

            .login-button {
                background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%);
                position: relative;
            }

            .login-button::after {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%, rgba(255, 255, 255, 0.1) 100%);
                opacity: 0;
                transition: opacity 0.3s ease;
            }

            .login-button:hover::after {
                opacity: 1;
            }

            .button-content {
                position: relative;
                z-index: 2;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 600;
                letter-spacing: 0.025em;
            }

            .quick-access-container {
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.3);
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            }

            .quick-access-title {
                background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                font-weight: 700;
                position: relative;
            }

            .quick-access-title::after {
                content: '';
                position: absolute;
                bottom: -4px;
                left: 0;
                width: 40px;
                height: 2px;
                background: linear-gradient(135deg, #0a2f6c, #2563eb);
                border-radius: 1px;
            }

            @media (prefers-reduced-motion: reduce) {
                .modern-button, .button-icon, .floating-animation {
                    animation: none;
                    transition: none;
                }
            }
        `;
        document.head.appendChild(styleSheet);

        const animationScript = document.createElement("script");
        animationScript.innerHTML = `
            window.addEventListener('load', function() {
                setTimeout(function() {
                    const header = document.querySelector('.header-animation');
                    const footer = document.querySelector('.footer-animation');
                    const contacts = document.querySelectorAll('.contact-animation');
                    
                    if (header) header.style.animation = 'slideInDown 1.2s ease-out forwards';
                    if (footer) footer.style.animation = 'slideInUp 1.2s ease-out forwards';
                    
                    contacts.forEach((contact, index) => {
                        contact.style.animation = 'fadeIn 1s ease-out forwards';
                        contact.style.animationDelay = (0.3 * (index + 1)) + 's';
                    });
                }, 300);
            });
        `;
        document.head.appendChild(animationScript);

        return () => {
            document.head.removeChild(styleSheet);
            if (document.head.contains(animationScript)) {
                document.head.removeChild(animationScript);
            }
        };
    }, []);

    return (
        <>
            <Head title="Biblioteca Madre Caridad">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=outfit:300,400,500,600,700|montserrat:400,500,600,700&display=swap" rel="stylesheet" />
            </Head>
            <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 to-white text-gray-800 font-['Montserrat',sans-serif] relative">
                {/* Header un poco más grande pero sin scroll */}
                <header className="bg-[#0a2f6c] sticky top-0 z-50 shadow-md py-1.5 header-animation">
                    <div className="container mx-auto px-4">
                        <nav className="flex items-center justify-between">
                            <div className="flex items-center">
                                {/* Logo tamaño controlado - sin scroll */}
                                <div className="w-36 h-14 sm:w-44 sm:h-16 lg:w-52 lg:h-18 relative">
                                    <img 
                                        src="/IMG/logoColegio.png" 
                                        alt="Logo Biblioteca Madre Caridad" 
                                        className="w-full h-full object-contain drop-shadow-lg" 
                                    />
                                </div>
                            </div>
                            
                            {/* Botón del header */}
                            <div className="flex items-center">
                                <a
                                    href="https://franciscanaspasto.edu.co" 
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="rounded-md bg-white text-blue-900 px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium transition-all hover:bg-blue-50 hover:scale-105 whitespace-nowrap"
                                >
                                    Nuestra institución
                                </a>
                            </div>
                        </nav>
                    </div>
                </header>

                {/* Main Content - ajuste compacto */}
                <main className="flex-1 container mx-auto px-4 py-3 flex items-center justify-center">
                    <div className="w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-xl transition-all duration-300 hover:shadow-2xl dark:bg-gray-800/95 dark:shadow-gray-900/30 border border-blue-100 dark:border-blue-900/20 relative">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#0a2f6c] to-transparent opacity-50"></div>
                        <div className="flex flex-col lg:flex-row min-h-[360px]">
                            {/* Left Content - más compacto y mejor distribuido */}
                            <div className="order-2 w-full p-5 lg:order-1 lg:w-1/2 lg:p-6 flex flex-col justify-center">
                                <div className="relative mb-5">
                                    <div className="absolute -top-3 -left-3 w-8 h-8 bg-blue-100 rounded-full opacity-70 dark:bg-blue-900/30 animate-pulse"></div>
                                    <h1 className="mb-2 text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white tracking-tight relative z-10 flex items-center">
                                        Biblioteca
                                        <div className="ml-2 w-2 h-4 bg-[#0a2f6c] dark:bg-blue-500 rounded animate-pulse"></div>
                                    </h1>
                                    <h2 className="text-xl lg:text-2xl font-semibold text-[#0a2f6c] dark:text-blue-300 tracking-wide">
                                        Madre Caridad
                                    </h2>
                                    <div className="mt-3 h-1 w-20 rounded-full bg-[#0a2f6c] dark:bg-gray-500 animate-pulse"></div>
                                </div>
                                
                                <div className="relative p-4 mb-5 bg-slate-50 dark:bg-gray-700/30 rounded-xl shadow-inner border-l-4 border-[#0a2f6c] dark:border-gray-500">
                                    <div className="absolute -top-1 -right-1 text-blue-500 dark:text-gray-500 opacity-30 text-3xl">❝</div>
                                    <p className="text-gray-700 dark:text-gray-300 italic text-sm lg:text-base leading-relaxed">
                                        La biblioteca no es solo un lugar para leer, es un universo donde las palabras se convierten en caminos hacia otros mundos.
                                    </p>
                                    <div className="absolute -bottom-1 -right-1 text-blue-500 dark:text-gray-500 opacity-30 text-3xl">❞</div>
                                </div>
                                
                                {/* Botones mejorados */}
                                <div className="space-y-4 rounded-xl quick-access-container p-5 shadow-xl relative overflow-hidden floating-animation">
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-blue-100/50 to-transparent rounded-bl-3xl opacity-60"></div>
                                    <div className="absolute bottom-0 left-0 w-12 h-12 bg-gradient-to-tr from-indigo-100/30 to-transparent rounded-tr-3xl opacity-40"></div>
                                    
                                    <h3 className="quick-access-title text-lg mb-4 relative z-10">
                                        Acceso rápido
                                    </h3>
                                    
                                    <Link
                                        href={route('buscar')}
                                        className="modern-button search-button group w-full rounded-xl text-white px-6 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 relative z-10 block"
                                    >
                                        <div className="button-content">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="button-icon h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                            <span className="relative">
                                                Buscar Material Bibliográfico
                                                <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white/50 transition-all duration-300 group-hover:w-full"></div>
                                            </span>
                                        </div>
                                    </Link>
                                    
                                    {auth.user ? (
                                        <Link
                                            href={route('dashboard')}
                                            className="modern-button dashboard-button group w-full rounded-xl text-white px-6 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 relative z-10 block"
                                        >
                                            <div className="button-content">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="button-icon h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                </svg>
                                                <span className="relative">
                                                    Ir al Dashboard
                                                    <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white/50 transition-all duration-300 group-hover:w-full"></div>
                                                </span>
                                            </div>
                                        </Link>
                                    ) : (
                                        <Link
                                            href={route('login')}
                                            className="modern-button login-button group w-full rounded-xl text-white px-6 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 relative z-10 block"
                                        >
                                            <div className="button-content">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="button-icon h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                                </svg>
                                                <span className="relative">
                                                    Iniciar Sesión
                                                    <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white/50 transition-all duration-300 group-hover:w-full"></div>
                                                </span>
                                            </div>
                                        </Link>
                                    )}
                                </div>
                            </div>
                            
                            {/* Right Image - llena toda la altura sin espacios */}
                            <div className="order-1 w-full lg:order-2 lg:w-1/2">
                                <div className="relative h-56 lg:h-full w-full overflow-hidden group cursor-pointer img-hover-container">
                                    <img
                                        src="/IMG/chico.jpg"
                                        alt="Biblioteca"
                                        className="h-full w-full object-cover img-hover-effect"
                                        style={{ objectPosition: 'center 15%' }}
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-0">
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#0a2f6c]/30 to-transparent opacity-40"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                {/* Footer más compacto */}
                <footer className="bg-[#0a2f6c] text-center dark:bg-gray-800 py-2 footer-animation">
                    <div className="container mx-auto px-4 relative">
                        <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
                            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white to-transparent"></div>
                            <div className="grid grid-cols-10 h-full w-full">
                                {[...Array(10)].map((_, i) => (
                                    <div key={i} className="border-r border-white/10 h-full"></div>
                                ))}
                            </div>
                        </div>
                        
                        <div className="my-2">
                            <h3 className="text-sm font-medium text-white mb-2">
                                Contáctanos
                            </h3>
                            
                            <div className="flex flex-col md:flex-row justify-center gap-3 md:gap-6">
                                <div className="flex items-center justify-center contact-animation" style={{ animationDelay: '0.3s' }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span className="text-white text-xs">
                                        Calle 18 No. 32A – 39
                                    </span>
                                </div>
                                
                                <div className="flex items-center justify-center contact-animation" style={{ animationDelay: '0.6s' }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    <span className="text-white text-xs">3137329836</span>
                                </div>
                                
                                <div className="flex items-center justify-center contact-animation" style={{ animationDelay: '0.9s' }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    <div className="text-center md:text-left">
                                        <p className="text-white text-xs">liceo.merced@franciscanaspasto.edu.co</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="border-t border-blue-400/20 pt-1">
                            <p className="text-xs text-white/90">
                                © {new Date().getFullYear()} Liceo de la Merced Maridíaz - Todos los derechos reservados.
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}