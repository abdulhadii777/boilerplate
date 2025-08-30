import { Badge } from '@/shared/components/ui/badge';

interface WelcomeSectionProps {
    user: {
        name: string;
        role: string;
    };
}

export default function WelcomeSection({ user }: WelcomeSectionProps) {
    return (
        <div className="flex items-center justify-between">
            <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                    Welcome back, {user.name}! Here's what's happening with your organization.
                </p>
            </div>
            <Badge variant={user.role === 'owner' ? 'default' : 'secondary'} className="text-xs">
                {user.role}
            </Badge>
        </div>
    );
}
