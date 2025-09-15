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
        title: 'Profile',
        name: 'profile.edit',
        icon: null,
    },
    {
        title: 'Password',
        name: 'password.edit',
        icon: null,
    },
    {
        title: 'Notifications',
        name: 'notifications',
        icon: null,
    },
    {
        title: 'Appearance',
        name: 'appearance',
        icon: null,
    },
];

export default function SettingsLayout({ children }: PropsWithChildren) {
    const tenantRoute = useTenantRoute()
    const page = usePage()

    const isActive = (itemName: string) => {
        const itemUrl = tenantRoute(itemName);
        const currentUrl = page.url;
        
        // Special handling for different manage-profile pages
        if (itemName === 'profile.edit') {
            return currentUrl.includes('/manage-profile/profile');
        } else if (itemName === 'password.edit') {
            return currentUrl.includes('/manage-profile/password');
        } else if (itemName === 'notifications') {
            return currentUrl.includes('/manage-profile/notifications');
        } else if (itemName === 'appearance') {
            return currentUrl.includes('/manage-profile/appearance');
        }
        
        return currentUrl === itemUrl;
    };

    return (
        <div className="px-4 py-6">
            <Heading title="Settings" description="Manage your profile and account settings" />

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
                                <Link href= {tenantRoute(item.name)} prefetch>
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
