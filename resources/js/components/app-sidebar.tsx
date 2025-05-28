import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, BookUser, NotebookPen,Navigation,GraduationCap,UsersRound,BookPlus,BookX } from 'lucide-react';
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
        title: 'Libros',
        href: '/libros',
        icon: BookOpen,
    },

    {
        title: 'Grados',
        href: '/grados',
        icon: GraduationCap,
    },
    {
        title: 'Lectores',
        href: '/lectores',
        icon: UsersRound,
    },    
    {
        title: 'Prestamos',
        href: '/prestamos',
        icon: BookPlus,
    },
    {
        title: 'Devoluciones',
        href: '/prestamos/devoluciones',
        icon: BookX,
    },
    {
        title: 'Préstamos Vencidos',
        href: '/prestamos/vencidos',
        icon: BookX,
    },
];

const footerNavItems: NavItem[] = [

];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
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
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
