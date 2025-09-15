import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CreateBusinessDialog } from '@/components/business/create-business-dialog';
import { ChevronDown, Building2, Plus, Star } from 'lucide-react';
import { usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';
import type { MainPageProps, Business } from '@/types';

export function BusinessDropdown() {
    const page = usePage<MainPageProps>();
    const { businesses, currentBusiness } = page.props;
    const [createDialogOpen, setCreateDialogOpen] = useState(false);

    const handleBusinessSwitch = (businessId: string) => {
        router.post(route('business.switch', businessId), {}, {
            preserveState: false,
            preserveScroll: false,
        });
    };

    const handleCreateBusiness = () => {
        setCreateDialogOpen(true);
    };

    const handleToggleFavorite = (businessId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        router.post(route('business.toggle-favorite', businessId), {}, {
            preserveState: false,
            preserveScroll: false,
        });
    };

    return (
        <TooltipProvider>
            <DropdownMenu>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="w-full justify-between px-2 py-2 h-auto data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                            >
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <Building2 className="h-4 w-4 shrink-0" />
                                    <span className="truncate text-sm font-medium group-data-[collapsible=icon]:hidden">
                                        {currentBusiness?.name || 'Select Business'}
                                    </span>
                                </div>
                                <ChevronDown className="h-4 w-4 shrink-0 group-data-[collapsible=icon]:hidden" />
                            </Button>
                        </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="group-data-[collapsible=icon]:block group-data-[collapsible=icon]:hidden">
                        <p>{currentBusiness?.name || 'Select Business'}</p>
                    </TooltipContent>
                </Tooltip>
                <DropdownMenuContent className="w-64" align="start">
                    <DropdownMenuLabel>Your Businesses</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {businesses.length === 0 ? (
                        <div className="px-2 py-1.5 text-sm text-muted-foreground">
                            No businesses found
                        </div>
                    ) : (
                        businesses.map((business: Business) => (
                            <DropdownMenuItem
                                key={business.id}
                                onClick={() => handleBusinessSwitch(business.id)}
                                className="cursor-pointer"
                            >
                                <div className="flex items-center gap-2 w-full">
                                    <Building2 className="h-4 w-4 shrink-0" />
                                    <span className="truncate flex-1">
                                        {business.name}
                                    </span>
                                    <div className="flex items-center gap-1 shrink-0">
                                        {business.is_current && (
                                            <span className="text-xs text-muted-foreground">
                                                Current
                                            </span>
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 w-6 p-0 hover:bg-transparent"
                                            onClick={(e) => handleToggleFavorite(business.id, e)}
                                        >
                                            <Star className={`h-3 w-3 ${
                                                business.is_favorite 
                                                    ? 'fill-yellow-400 text-yellow-400' 
                                                    : 'text-muted-foreground hover:text-yellow-400'
                                            }`} />
                                        </Button>
                                    </div>
                                </div>
                            </DropdownMenuItem>
                        ))
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        onClick={handleCreateBusiness}
                        className="cursor-pointer"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Create New Business
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <CreateBusinessDialog
                open={createDialogOpen}
                onClose={() => setCreateDialogOpen(false)}
            />
        </TooltipProvider>
    );
}
