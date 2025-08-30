import { Menu } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { Button } from '@/shared/components/ui/button';
import { ThemeToggle } from '@/shared/components/ui/theme-toggle';

interface HeaderProps {
    pageTitle?: string;
    user?: {
        name: string;
        email: string;
    };
    onMenuToggle?: () => void;
    showMenuButton?: boolean;
}

export function Header({ pageTitle, user, onMenuToggle, showMenuButton = false }: HeaderProps) {
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase();
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-16 items-center px-6">
                {showMenuButton && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="mr-4 px-0 text-base lg:hidden"
                        onClick={onMenuToggle}
                    >
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle menu</span>
                    </Button>
                )}
                
                <div className="flex items-center space-x-3">
                    <div className="hidden md:block">
                        <div className="text-lg font-semibold">{pageTitle || 'Dashboard'}</div>
                    </div>
                    <div className="md:hidden">
                        <div className="text-lg font-semibold">{pageTitle || 'Dashboard'}</div>
                    </div>
                </div>
                
                <div className="ml-auto flex items-center space-x-3">
                    <ThemeToggle />
                    {user && (
                        <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                                {getInitials(user.name)}
                            </AvatarFallback>
                        </Avatar>
                    )}
                </div>
            </div>
        </header>
    );
}
