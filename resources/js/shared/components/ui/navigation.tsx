import { LucideIcon } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { cn } from '@/shared/utils';

interface NavigationItem {
    name: string;
    href: string;
    icon: LucideIcon;
    current: boolean;
    disabled?: boolean;
    permission?: string;
}

interface NavigationProps {
    items: NavigationItem[];
    className?: string;
}

export function Navigation({ items, className }: NavigationProps) {
    return (
        <nav className={cn('flex flex-col space-y-1', className)}>
            {items.map((item) => {
                const Icon = item.icon;
                return (
                    <Link
                        key={item.name}
                        href={item.disabled ? '#' : item.href}
                        className={cn(
                            'group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
                            item.current
                                ? 'bg-primary text-primary-foreground shadow-sm'
                                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                            item.disabled && 'cursor-not-allowed opacity-50'
                        )}
                        aria-current={item.current ? 'page' : undefined}
                        onClick={item.disabled ? (e) => e.preventDefault() : undefined}
                    >
                        <Icon 
                            className={cn(
                                'mr-3 h-4 w-4 flex-shrink-0 transition-colors',
                                item.current ? 'text-primary-foreground' : 'text-muted-foreground'
                            )} 
                            aria-hidden="true" 
                        />
                        <span className="truncate">{item.name}</span>
                        {item.disabled && (
                            <span className="ml-auto text-xs text-muted-foreground">(Soon)</span>
                        )}
                    </Link>
                );
            })}
        </nav>
    );
}
