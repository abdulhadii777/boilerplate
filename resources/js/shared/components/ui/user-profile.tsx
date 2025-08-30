import { LogOut, Settings, User } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { Button } from '@/shared/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';

interface UserProfileProps {
    user: {
        name: string;
        email: string;
        role: string;
    };
}

export function UserProfile({ user }: UserProfileProps) {
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase();
    };

    const handleLogout = () => {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = '/logout';
        
        const tokenInput = document.createElement('input');
        tokenInput.type = 'hidden';
        tokenInput.name = '_token';
        tokenInput.value = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
        
        form.appendChild(tokenInput);
        document.body.appendChild(form);
        form.submit();
    };

    return (
        <div className="border-t border-border p-4">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="w-full justify-start p-2">
                        <Avatar className="mr-3 h-8 w-8">
                            <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                                {getInitials(user.name)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col items-start text-left">
                            <div className="text-sm font-medium truncate">{user.name}</div>
                            <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                        </div>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
