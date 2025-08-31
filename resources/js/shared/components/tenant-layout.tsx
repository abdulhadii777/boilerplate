import { Building2, Home, Settings, Shield, Users } from 'lucide-react';
import { PropsWithChildren, useState } from 'react';

import { Header } from '@/shared/components/ui/header';
import { Navigation } from '@/shared/components/ui/navigation';
import { UserProfile } from '@/shared/components/ui/user-profile';
import { cn } from '@/shared/utils';
import { usePermissions } from '@/shared/hooks/usePermissions';
import type { TenantPermissions } from '@/shared/utils/permissions';

interface TenantLayoutProps extends PropsWithChildren {
    className?: string;
}

export default function TenantLayout({ children, className }: TenantLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    
    // Get data from Inertia shared props (no API calls needed!)
    const { can, currentUser, tenant } = usePermissions();

    // Get tenant ID from URL for navigation
    const getTenantId = () => {
        const pathParts = window.location.pathname.split('/');
        const tenantIndex = pathParts.findIndex(part => part === 't');
        return pathParts[tenantIndex + 1] || tenant.id;
    };

    const tenantId = getTenantId();

    const navigation = [
        {
            name: 'Dashboard',
            href: `/t/${tenantId}/dashboard`,
            icon: Home,
            current: typeof window !== 'undefined' && window.location.pathname.endsWith('/dashboard'),
        },
        {
            name: 'Role Management',
            href: `/t/${tenantId}/roles`,
            icon: Shield,
            current: typeof window !== 'undefined' && window.location.pathname.includes('/roles'),
            permission: 'can_manage_roles',
        },
        {
            name: 'User Management',
            href: `/t/${tenantId}/users`,
            icon: Users,
            current: typeof window !== 'undefined' && window.location.pathname.includes('/users'),
            permission: 'can_manage_users',
        },
        {
            name: 'Settings',
            href: '#',
            icon: Settings,
            current: false,
            disabled: true,
            permission: 'can_manage_settings',
        },
    ];

    const filteredNavigation = navigation.filter((item) => {
        if (!item.permission) return true;
        // Add safety check in case permissions aren't loaded yet
        try {
            return can(item.permission as keyof TenantPermissions);
        } catch {
            return false;
        }
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
                                <div className="text-sm font-semibold text-sidebar-foreground">{tenant.name}</div>
                                <div className="text-xs text-sidebar-foreground/70">Tenant Portal</div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex-1 px-4 py-6">
                        <Navigation items={filteredNavigation} />
                    </div>

                    {/* User Profile */}
                    <UserProfile user={currentUser} />
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
                    user={{ name: currentUser.name, email: currentUser.email }}
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
