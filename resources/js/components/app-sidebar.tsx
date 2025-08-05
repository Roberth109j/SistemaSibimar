import { NavFooter } from '@/components/nav-footer';
import { NavUser } from '@/components/nav-user';
import { 
    Sidebar, 
    SidebarContent, 
    SidebarFooter, 
    SidebarHeader, 
    SidebarMenu, 
    SidebarMenuButton, 
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarGroup,
    SidebarGroupContent,
    useSidebar
} from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { 
    BookOpen, 
    LayoutGrid, 
    BookUser, 
    NotebookPen,
    Navigation,
    GraduationCap,
    UsersRound,
    BookUp2,
    Folder,
    Undo2,
    BookmarkX,
    ArrowRightLeft,
    FolderClock,
    ChevronDown,
    NotebookTabs,
    FileBarChart
} from 'lucide-react';
import { useState, useRef, useCallback } from 'react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Autores',
        href: '/autores',
        icon: BookUser,
    },
    {
        title: 'Editoriales',
        href: '/editoriales',
        icon: NotebookPen,
    },
    {
        title: 'Estanterias',
        href: '/estanterias',
        icon: Navigation,
    },
    {
        title: 'Grados',
        href: '/grados',
        icon: GraduationCap,
    },
    {
        title: 'Libros',
        href: '/libros',
        icon: BookOpen,
    },
    {
        title: 'Lectores',
        href: '/lectores',
        icon: UsersRound,
    },
    {
        title: 'Prestamos',
        href: '/prestamos',
        icon: BookUp2,
    },
    {
        title: 'Devoluciones',
        href: '/devoluciones',
        icon: Undo2,
    },
    {
        title: 'Historial de préstamos',
        href: '/reportes/historial-prestamos',
        icon: FolderClock,
    },
    {
        title: 'Generación de Informes',
        href: '/informes',
        icon: FileBarChart,
    },

    {
        title: 'Inventario',
        href: '/inventario',
        icon: NotebookTabs,
    },
];

const footerNavItems: NavItem[] = [];

export function AppSidebar() {
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
    const sidebarRef = useRef<HTMLDivElement>(null);
    const { setOpen } = useSidebar();

    // Optimizar con useCallback para evitar re-renders innecesarios
    const toggleSection = useCallback((sectionKey: string) => {
        // Expandir sidebar primero (más eficiente)
        setOpen(true);
        
        // Luego actualizar las secciones
        setOpenSections(prev => ({
            ...prev,
            [sectionKey]: !prev[sectionKey]
        }));
        
        // Fallback optimizado con requestAnimationFrame para mejor performance
        if (sidebarRef.current?.classList.contains('collapsed')) {
            requestAnimationFrame(() => {
                if (sidebarRef.current) {
                    sidebarRef.current.classList.remove('collapsed');
                    sidebarRef.current.style.width = '240px';
                    // Usar setTimeout para el resize event para evitar bloquear el thread principal
                    setTimeout(() => {
                        window.dispatchEvent(new Event('resize'));
                    }, 0);
                }
            });
        }
    }, [setOpen]);

    // Memorizar los items filtrados para evitar recálculos
    const dashboardItem = mainNavItems.find(item => item.title === 'Dashboard')!;
    const gestionItems = mainNavItems.filter(item => 
        ['Autores', 'Estanterias', 'Editoriales', 'Grados'].includes(item.title)
    );
    const librosItem = mainNavItems.find(item => item.title === 'Libros')!;
    const lectoresItem = mainNavItems.find(item => item.title === 'Lectores')!;
    const prestamosItems = mainNavItems.filter(item => 
        ['Prestamos', 'Devoluciones', 'Historial de préstamos'].includes(item.title)
    );
    const informesItem = mainNavItems.find(item => item.title === 'Generación de Informes')!;
    const inventarioItem = mainNavItems.find(item => item.title === 'Inventario')!;

    return (
        <Sidebar 
            ref={sidebarRef} 
            collapsible="icon" 
            variant="inset" 
            className="transition-all duration-200 ease-out"
        >
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {/* Dashboard */}
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <Link href={dashboardItem.href!}>
                                        {dashboardItem.icon && <dashboardItem.icon className="h-5 w-5" />}
                                        <span>{dashboardItem.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>

                            {/* Gestión General - Autores, Estanterías, Editoriales, Grados */}
                            <SidebarMenuItem>
                                <SidebarMenuButton 
                                    onClick={() => toggleSection('gestion')}
                                    className="w-full justify-start [&>svg:last-child]:ml-auto cursor-pointer transition-colors duration-150"
                                >
                                    <Folder className="h-5 w-5" />
                                    <span>Gestión General</span>
                                    <ChevronDown 
                                        className={`h-4 w-4 transition-transform duration-200 ease-out ${
                                            openSections.gestion ? 'rotate-180' : ''
                                        }`} 
                                    />
                                </SidebarMenuButton>
                                {openSections.gestion && (
                                    <SidebarMenuSub className="animate-in slide-in-from-top-2 duration-200">
                                        {gestionItems.map((item) => {
                                            const IconComponent = item.icon;
                                            return (
                                                <SidebarMenuSubItem key={item.title}>
                                                    <SidebarMenuSubButton asChild>
                                                        <Link href={item.href!}>
                                                            {IconComponent && <IconComponent className="h-5 w-5" />}
                                                            <span>{item.title}</span>
                                                        </Link>
                                                    </SidebarMenuSubButton>
                                                </SidebarMenuSubItem>
                                            );
                                        })}
                                    </SidebarMenuSub>
                                )}
                            </SidebarMenuItem>

                            {/* Operaciones de Préstamos */}
                            <SidebarMenuItem>
                                <SidebarMenuButton 
                                    onClick={() => toggleSection('prestamos')}
                                    className="w-full justify-start [&>svg:last-child]:ml-auto cursor-pointer transition-colors duration-150"
                                >
                                    <ArrowRightLeft className="h-5 w-5" />
                                    <span>Gestión de Préstamos</span>
                                    <ChevronDown 
                                        className={`h-4 w-4 transition-transform duration-200 ease-out ${
                                            openSections.prestamos ? 'rotate-180' : ''
                                        }`} 
                                    />
                                </SidebarMenuButton>
                                {openSections.prestamos && (
                                    <SidebarMenuSub className="animate-in slide-in-from-top-2 duration-200">
                                        {prestamosItems.map((item) => {
                                            const IconComponent = item.icon;
                                            return (
                                                <SidebarMenuSubItem key={item.title}>
                                                    <SidebarMenuSubButton asChild>
                                                        <Link href={item.href!}>
                                                            {IconComponent && <IconComponent className="h-5 w-5" />}
                                                            <span>{item.title}</span>
                                                        </Link>
                                                    </SidebarMenuSubButton>
                                                </SidebarMenuSubItem>
                                            );
                                        })}
                                    </SidebarMenuSub>
                                )}
                            </SidebarMenuItem>

                            {/* Libros - Individual */}
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <Link href={librosItem.href!}>
                                        {librosItem.icon && <librosItem.icon className="h-5 w-5" />}
                                        <span>{librosItem.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>

                            {/* Lectores - Individual */}
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <Link href={lectoresItem.href!}>
                                        {lectoresItem.icon && <lectoresItem.icon className="h-5 w-5" />}
                                        <span>{lectoresItem.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>

                            {/* Generación de Informes - Individual */}
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <Link href={informesItem.href!}>
                                        {informesItem.icon && <informesItem.icon className="h-5 w-5" />}
                                        <span>{informesItem.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            {/* Inventario - Individual */}
                            
                            {/* Generación de Informes - Individual */}
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <Link href={inventarioItem.href!}>
                                        {inventarioItem.icon && <inventarioItem.icon className="h-5 w-5" />}
                                        <span>{inventarioItem.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            
            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}