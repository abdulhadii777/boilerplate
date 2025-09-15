import { Button } from '@/components/ui/button';
import Heading from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';
import { useTenantRoute } from '@/utils/tenantRoute';

const sidebarNavItems: NavItem[] = [
    {
        title: 'General',
        name: 'settings.general',
        icon: null,
    },
    {
        title: 'Security',
        name: 'settings.security',
        icon: null,
    },
    {
        title: 'Integrations',
        name: 'settings.integrations',
        icon: null,
    },
    {
        title: 'Billing',
        name: 'settings.billing',
        icon: null,
    },
    {
        title: 'Team',
        name: 'settings.team',
        icon: null,
    },
    {
        title: 'API Keys',
        name: 'settings.api-keys',
        icon: null,
    },
];

export default function SettingsLayout({ children }: PropsWithChildren) {
    const tenantRoute = useTenantRoute()
    const page = usePage()

    const isActive = (itemName: string) => {
        const itemUrl = tenantRoute(itemName);
        const currentUrl = page.url;
        
        // Extract path from both URLs for comparison
        const getPathFromUrl = (url: string) => {
            try {
                const urlObj = new URL(url, window.location.origin);
                return urlObj.pathname;
            } catch {
                return url.split('?')[0].split('#')[0];
            }
        };
        
        const currentPath = getPathFromUrl(currentUrl);
        const itemPath = getPathFromUrl(itemUrl);
        
        // Special handling for different settings pages
        if (itemName === 'settings.general') {
            return currentPath.includes('/settings/general');
        } else if (itemName === 'settings.security') {
            return currentPath.includes('/settings/security');
        } else if (itemName === 'settings.integrations') {
            return currentPath.includes('/settings/integrations');
        } else if (itemName === 'settings.billing') {
            return currentPath.includes('/settings/billing');
        } else if (itemName === 'settings.team') {
            return currentPath.includes('/settings/team');
        } else if (itemName === 'settings.api-keys') {
            return currentPath.includes('/settings/api-keys');
        }
        
        return currentPath === itemPath || currentPath.startsWith(itemPath + '/');
    };

    return (
        <div className="px-4 py-6">
            <Heading title="Settings" description="Manage your application settings and preferences" />

            <div className="flex flex-col lg:flex-row lg:space-x-12">
                <aside className="w-full max-w-xl lg:w-48">
                    <nav className="flex flex-col space-y-1 space-x-0">
                        {sidebarNavItems.map((item, index) => (
                            <Button
                                key={`${item.name}-${index}`}
                                size="sm"
                                variant="ghost"
                                asChild
                                className={cn('w-full justify-start', {
                                    'bg-muted': isActive(item.name),
                                })}
                            >
                                <Link href={tenantRoute(item.name)} prefetch>
                                    {item.title}
                                </Link>
                            </Button>
                        ))}
                    </nav>
                </aside>

                <Separator className="my-6 lg:hidden" />

                <div className="flex-1 md:max-w-2xl">
                    <section className="max-w-xl space-y-12">{children}</section>
                </div>
            </div>
        </div>
    );
}
