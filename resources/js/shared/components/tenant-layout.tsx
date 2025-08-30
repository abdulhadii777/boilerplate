import { Building2, Home, Settings, Shield, Users } from 'lucide-react';
import { PropsWithChildren, useState } from 'react';

import { Header } from '@/shared/components/ui/header';
import { Navigation } from '@/shared/components/ui/navigation';
import { UserProfile } from '@/shared/components/ui/user-profile';
import { cn } from '@/shared/utils';

interface TenantLayoutProps extends PropsWithChildren {
    className?: string;
    tenant: {
        id: string;
        name: string;
    };
    user: {
        name: string;
        email: string;
        role: string;
    };
    permissions: {
        can_manage_users: boolean;
        can_manage_roles: boolean;
        can_view_analytics: boolean;
        can_manage_settings: boolean;
    };
}

export default function TenantLayout({ children, className, tenant, user, permissions }: TenantLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const navigation = [
        {
            name: 'Dashboard',
            href: `/t/${tenant?.id}/dashboard`,
            icon: Home,
            current: window.location.pathname.endsWith('/dashboard'),
        },
        {
            name: 'Role Management',
            href: `/t/${tenant?.id}/roles`,
            icon: Shield,
            current: window.location.pathname.includes('/roles'),
            permission: 'can_manage_roles' as keyof typeof permissions,
        },
        {
            name: 'User Management',
            href: '#',
            icon: Users,
            current: false,
            disabled: true,
            permission: 'can_manage_users' as keyof typeof permissions,
        },
        {
            name: 'Settings',
            href: '#',
            icon: Settings,
            current: false,
            disabled: true,
            permission: 'can_manage_settings' as keyof typeof permissions,
        },
    ];

    const filteredNavigation = navigation.filter((item) => {
        if (!item.permission) return true;
        return permissions?.[item.permission];
    });

    // Get current page title from navigation
    const getCurrentPageTitle = () => {
        const currentItem = filteredNavigation.find(item => item.current);
        return currentItem?.name || 'Dashboard';
    };

    return (
        <div className="flex min-h-screen bg-background">
            {/* Sidebar */}
            <div className={cn(
                'fixed inset-y-0 left-0 z-50 w-64 transform bg-sidebar border-r border-sidebar-border transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
                sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            )}>
                <div className="flex h-full flex-col">
                    {/* Sidebar Header */}
                    <div className="flex h-16 items-center px-6 border-b border-sidebar-border">
                        <div className="flex items-center space-x-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                                <Building2 className="h-5 w-5 text-primary-foreground" />
                            </div>
                            <div>
                                <div className="text-sm font-semibold text-sidebar-foreground">{tenant?.name || 'Organization'}</div>
                                <div className="text-xs text-sidebar-foreground/70">Tenant Portal</div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex-1 px-4 py-6">
                        <Navigation items={filteredNavigation} />
                    </div>

                    {/* User Profile */}
                    <UserProfile user={user} />
                </div>
            </div>

            {/* Mobile overlay */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main content */}
            <div className="flex flex-1 flex-col lg:ml-0">
                <Header 
                    pageTitle={getCurrentPageTitle()}
                    user={user}
                    onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
                    showMenuButton={true}
                />
                
                <main className={cn('flex-1 overflow-y-auto', className)}>
                    {children}
                </main>
            </div>
        </div>
    );
}
