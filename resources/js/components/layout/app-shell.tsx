import { SidebarProvider } from '@/components/ui/sidebar';
import { type MainPageProps } from '@/types';
import { usePage } from '@inertiajs/react';

interface AppShellProps {
    children: React.ReactNode;
    variant?: 'header' | 'sidebar';
}

export function AppShell({ children }: AppShellProps) {
    const { sidebarOpen } = usePage<MainPageProps>().props;
    const isOpen = sidebarOpen as boolean;
    return <SidebarProvider defaultOpen={isOpen}>{children}</SidebarProvider>;
}
