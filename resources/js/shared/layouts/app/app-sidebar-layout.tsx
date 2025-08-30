import { type BreadcrumbItem } from '@/shared/types';
import { type ReactNode } from 'react';

import { AppShell } from '@/shared/components/app-shell';
import { AppSidebar } from '@/shared/components/app-sidebar';
import { AppHeader } from '@/shared/components/app-header';

interface AppSidebarLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default function AppSidebarLayout({ children, breadcrumbs, ...props }: AppSidebarLayoutProps) {
    return (
        <AppShell>
            <AppSidebar />
            <div className="flex flex-1 flex-col">
                <AppHeader breadcrumbs={breadcrumbs} {...props} />
                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </AppShell>
    );
}
