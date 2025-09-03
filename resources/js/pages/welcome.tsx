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

            .header-animation { animation: slideInDown 1.2s ease-out forwards; }
            .footer-animation { animation: slideInUp 1.2s ease-out forwards; }
            .contact-animation { opacity: 0; animation: fadeIn 1s ease-out forwards; }
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
            <div className="min-h-screen overflow-hidden flex flex-col bg-gradient-to-br from-slate-50 to-white text-gray-800 font-['Montserrat',sans-serif] relative">
                {/* Header */}
                <header className="bg-[#0a2f6c] sticky top-0 z-50 shadow-md py-0.5 header-animation">
                    <div className="container mx-auto px-4">
                        <nav className="flex items-center justify-between">
                            <div className="flex items-center">
                                {/* Logo tipo banner */}
                                <div className="w-72 h-24 relative">
                                    <img 
                                        src="https://franciscanaspasto.edu.co/wp-content/uploads/2024/03/logo.png" 
                                        alt="Logo Biblioteca Madre Caridad" 
                                        className="w-full h-full object-contain drop-shadow-lg" 
                                    />
                                </div>
                            </div>
                            
                            <div className="flex items-center space-x-4">

                               <Link
                                    href={route('buscar')}
                                    className="rounded-lg bg-white text-blue-900 px-5 py-2 text-sm font-medium transition-all hover:translate-y-[-2px] hover:shadow-lg"
                                >
                                    Buscar Material
                                </Link>
                                {auth.user ? (
                                    <Link
                                        href={route('dashboard')}
                                        className="rounded-lg bg-white text-blue-900 px-5 py-2 text-sm font-medium transition-all hover:translate-y-[-2px] hover:shadow-lg"
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <Link
                                        href={route('login')}
                                        className="rounded-lg bg-white text-blue-900 px-5 py-2 text-sm font-medium transition-all hover:translate-y-[-2px] hover:shadow-lg"
                                    >
                                        Ingresar
                                    </Link>
                                )}
                            </div>
                        </nav>
                    </div>
                </header>

                {/* Main Content */}
                <main className="container mx-auto px-4 py-6 flex-grow flex items-center">
                    <div className="mx-auto w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-xl transition-all duration-300 hover:shadow-2xl dark:bg-gray-800/95 dark:shadow-gray-900/30 border border-blue-100 dark:border-blue-900/20 relative">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#0a2f6c] to-transparent opacity-50"></div>
                        <div className="flex flex-col lg:flex-row">
                            {/* Left Content */}
                            <div className="order-2 w-full p-4 lg:order-1 lg:w-1/2 lg:p-6">
                                <div className="relative mb-6">
                                    <div className="absolute -top-6 -left-6 w-12 h-12 bg-blue-100 rounded-full opacity-70 dark:bg-blue-900/30 animate-pulse"></div>
                                    <h1 className="mb-1 text-3xl font-bold text-gray-900 dark:text-white tracking-tight relative z-10 flex items-center">
                                        Biblioteca
                                        <div className="ml-2 w-2 h-5 bg-[#0a2f6c] dark:bg-blue-500 rounded animate-pulse"></div>
                                    </h1>
                                    <h2 className="text-2xl font-semibold text-[#0a2f6c] dark:text-blue-300 tracking-wide">
                                        Madre Caridad
                                    </h2>
                                    <div className="mt-3 h-1.5 w-24 rounded-full bg-[#0a2f6c] dark:bg-gray-500 animate-pulse"></div>
                                </div>
                                
                                <div className="relative p-5 mb-6 bg-slate-50 dark:bg-gray-700/30 rounded-xl shadow-inner border-l-4 border-[#0a2f6c] dark:border-gray-500">
                                    <div className="absolute -top-2 -right-2 text-blue-500 dark:text-gray-500 opacity-30 text-4xl">❝</div>
                                    <p className="text-gray-700 dark:text-gray-300 italic text-base">
                                        La biblioteca no es solo un lugar para leer, es un universo donde las palabras se convierten en caminos hacia otros mundos.
                                    </p>
                                    <div className="absolute -bottom-2 -right-2 text-blue-500 dark:text-gray-500 opacity-30 text-4xl">❞</div>
                                </div>
                                
                                <div className="mb-5 space-y-3 rounded-xl bg-gradient-to-br from-white to-slate-50 p-4 shadow-xl dark:from-gray-800 dark:to-gray-700/30 border border-slate-200 dark:border-gray-700/50 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-blue-50 dark:bg-blue-900/10 rounded-bl-3xl opacity-60"></div>
                                    <div className="flex items-center space-x-4 transform transition-transform hover:translate-x-2 relative z-10">
                                        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0a2f6c] text-white shadow-md dark:bg-gray-600">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                            </svg>
                                        </span>
                                        <span className="text-lg font-medium text-gray-700 dark:text-gray-200 flex items-center">
                                            El hogar de las ideas
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2 text-blue-500 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-4 transform transition-transform hover:translate-x-2 relative z-10">
                                        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md dark:bg-gray-600">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                            </svg>
                                        </span>
                                        <span className="text-lg font-medium text-gray-700 dark:text-gray-200 flex items-center">
                                            Cada libro, una aventura
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2 text-blue-500 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </span>
                                    </div>
                                </div>
                                
                                {/* Quitamos la sección de contacto de aquí ya que la movimos al footer */}
                                
                                <a
                                    href="https://franciscanaspasto.edu.co" 
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group inline-flex items-center rounded-lg px-6 py-3 text-base font-medium text-white transition-all hover:translate-y-[-2px] hover:shadow-xl relative overflow-hidden border border-blue-400/30"
                                >
                                    <span className="absolute inset-0 bg-[#0a2f6c] dark:bg-gray-600"></span>
                                    <span className="absolute inset-0 bg-[#0f3b83] dark:bg-gray-500 opacity-0 group-hover:opacity-100 transition-opacity z-0"></span>
                                    <span className="relative z-10 flex items-center">
                                        Conoce nuestra institución
                                        <svg className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </span>
                                </a>
                            </div>
                            
                            {/* Right Image */}
                            <div className="order-1 w-full lg:order-2 lg:w-1/2">
                                <div className="relative h-64 w-full overflow-hidden lg:h-full group cursor-pointer img-hover-container">
                                    <img
                                        src="/IMG/Bilbioteca.JPEG"
                                        alt="Biblioteca"
                                        className="h-full w-full object-cover object-center img-hover-effect"
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

                {/* Footer simplificado - solo contacto y copyright */}
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
                            <h3 className="text-lg font-medium text-white mb-3">
                                Contáctanos
                            </h3>
                            
                            <div className="flex flex-col md:flex-row justify-center gap-5 md:gap-10">
                                <div className="flex items-center justify-center contact-animation" style={{ animationDelay: '0.3s' }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span className="text-white text-sm">
                                        Calle 18 No. 32A – 39
                                    </span>
                                </div>
                                
                                <div className="flex items-center justify-center contact-animation" style={{ animationDelay: '0.6s' }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    <span className="text-white text-sm">3137329836</span>
                                </div>
                                
                                <div className="flex items-center justify-center contact-animation" style={{ animationDelay: '0.9s' }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    <div className="text-center md:text-left">
                                        <p className="text-white text-sm">liceo.merced@franciscanaspasto.edu.co</p>
                                        
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="border-t border-blue-400/20 pt-1.5">
                            <p className="text-xs text-white/90">
                                © {new Date().getFullYear()} Todos los derechos reservados.
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}