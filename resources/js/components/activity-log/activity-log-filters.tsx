import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { ActivityLogFilters } from '@/types';
import { format } from 'date-fns';
import { CalendarIcon, Clock, Filter, Plus, Search, User, X, Zap } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface ActivityLogFiltersProps {
    filters: ActivityLogFilters;
    availableFeatures: string[];
    availableActions: string[];
    availableUsers?: Array<{ id: number; name: string; email: string }>;
    onFiltersChange: (filters: ActivityLogFilters) => void;
    isLoading?: boolean;
}

export function ActivityLogFiltersComponent({
    filters,
    availableFeatures,
    availableActions,
    availableUsers,
    onFiltersChange,
    isLoading = false,
}: ActivityLogFiltersProps) {
    const [localFilters, setLocalFilters] = useState<ActivityLogFilters>(filters);
    const [dateFromOpen, setDateFromOpen] = useState(false);
    const [dateToOpen, setDateToOpen] = useState(false);
    const [showAddFilter, setShowAddFilter] = useState(false);
    const [maxHeight, setMaxHeight] = useState('80vh');
    const triggerRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        setLocalFilters(filters);
    }, [filters]);

    const calculateMaxHeight = useCallback(() => {
        if (triggerRef.current) {
            const triggerRect = triggerRef.current.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            const availableHeight = windowHeight - triggerRect.bottom - 20; // 20px margin
            const maxHeightPx = Math.max(200, availableHeight); // Minimum 200px
            setMaxHeight(`${maxHeightPx}px`);
        }
    }, []);

    useEffect(() => {
        if (showAddFilter) {
            calculateMaxHeight();
        }
    }, [showAddFilter, calculateMaxHeight]);

    // Debounced search function
    const debouncedSearch = useCallback(
        (() => {
            let timeoutId: NodeJS.Timeout;
            return (value: string) => {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => {
                    const newFilters = { ...localFilters, search: value };
                    setLocalFilters(newFilters);
                    onFiltersChange(newFilters);
                }, 300);
            };
        })(),
        [localFilters, onFiltersChange],
    );

    const handleFilterChange = (key: keyof ActivityLogFilters, value: string | number | undefined) => {
        const newFilters = { ...localFilters, [key]: value };
        setLocalFilters(newFilters);
        if (key !== 'search') {
            onFiltersChange(newFilters);
        }
    };

    const handleSearchChange = (value: string) => {
        setLocalFilters((prev) => ({ ...prev, search: value }));
        debouncedSearch(value);
    };

    const handleClearFilter = (key: keyof ActivityLogFilters) => {
        const newFilters = { ...localFilters, [key]: undefined };
        setLocalFilters(newFilters);
        onFiltersChange(newFilters);
    };

    const hasActiveFilters = Object.values(localFilters).some((value) => value !== undefined && value !== '');

    // Quick filter suggestions
    const quickFilters = [
        { key: 'feature', label: 'Feature', icon: Zap, options: availableFeatures },
        { key: 'action', label: 'Action', icon: Filter, options: availableActions },
        { key: 'performed_by', label: 'User', icon: User, options: availableUsers?.map((u) => ({ value: u.id.toString(), label: u.name })) || [] },
    ];

    return (
        <div className="space-y-3">
            {/* First Row: Search Bar and Add Filter Button */}
            <div className="flex items-center gap-3">
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                    <Input
                        placeholder="Search activity logs..."
                        value={localFilters.search || ''}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="pr-10 pl-10"
                    />
                    {localFilters.search && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="absolute top-1/2 right-1 h-6 w-6 -translate-y-1/2 transform p-0"
                            onClick={() => handleClearFilter('search')}
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    )}
                </div>

                {/* Add Filter Button */}
                <Popover open={showAddFilter} onOpenChange={setShowAddFilter}>
                    <PopoverTrigger asChild>
                        <Button ref={triggerRef} variant="outline" size="sm">
                            <Plus className="mr-1 h-4 w-4" />
                            Add Filter
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="z-50 w-96 p-0" style={{ maxHeight }} align="end">
                        <div className="border-b p-4">
                            <h4 className="font-medium">Add Filter</h4>
                        </div>

                        <div className="overflow-y-auto" style={{ maxHeight: `calc(${maxHeight} - 120px)` }}>
                            <div className="space-y-4 p-4">
                                {/* Quick Filters - Two columns */}
                                <div className="grid grid-cols-2 gap-3">
                                    {quickFilters.map((filter) => (
                                        <div key={filter.key} className="space-y-2">
                                            <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                                <filter.icon className="h-4 w-4" />
                                                {filter.label}
                                            </label>
                                            <Select
                                                value={localFilters[filter.key as keyof ActivityLogFilters]?.toString() || 'all'}
                                                onValueChange={(value) => {
                                                    if (filter.key === 'performed_by') {
                                                        handleFilterChange(
                                                            filter.key as keyof ActivityLogFilters,
                                                            value === 'all' ? undefined : parseInt(value),
                                                        );
                                                    } else {
                                                        handleFilterChange(
                                                            filter.key as keyof ActivityLogFilters,
                                                            value === 'all' ? undefined : value,
                                                        );
                                                    }
                                                    setShowAddFilter(false);
                                                }}
                                            >
                                                <SelectTrigger className="h-9">
                                                    <SelectValue placeholder={`All ${filter.label.toLowerCase()}s`} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All {filter.label.toLowerCase()}s</SelectItem>
                                                    {filter.options.map((option) => {
                                                        const value = typeof option === 'string' ? option : option.value;
                                                        const label = typeof option === 'string' ? option : option.label;
                                                        return (
                                                            <SelectItem key={value} value={value}>
                                                                {label}
                                                            </SelectItem>
                                                        );
                                                    })}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    ))}
                                </div>

                                {/* Date Range - Full width */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                        <CalendarIcon className="h-4 w-4" />
                                        Date Range
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <Popover open={dateFromOpen} onOpenChange={setDateFromOpen}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className={cn(
                                                        'h-9 flex-1 justify-start text-left font-normal',
                                                        !localFilters.date_from && 'text-muted-foreground',
                                                    )}
                                                >
                                                    {localFilters.date_from ? format(new Date(localFilters.date_from), 'MMM dd') : 'From'}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="z-[60] w-auto p-0" align="start" side="top" sideOffset={5}>
                                                <Calendar
                                                    mode="single"
                                                    selected={localFilters.date_from ? new Date(localFilters.date_from) : undefined}
                                                    onSelect={(date) => {
                                                        handleFilterChange('date_from', date ? format(date, 'yyyy-MM-dd') : undefined);
                                                        setDateFromOpen(false);
                                                    }}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>

                                        <Popover open={dateToOpen} onOpenChange={setDateToOpen}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className={cn(
                                                        'h-9 flex-1 justify-start text-left font-normal',
                                                        !localFilters.date_to && 'text-muted-foreground',
                                                    )}
                                                >
                                                    {localFilters.date_to ? format(new Date(localFilters.date_to), 'MMM dd') : 'To'}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="z-[60] w-auto p-0" align="start" side="top" sideOffset={5}>
                                                <Calendar
                                                    mode="single"
                                                    selected={localFilters.date_to ? new Date(localFilters.date_to) : undefined}
                                                    onSelect={(date) => {
                                                        handleFilterChange('date_to', date ? format(date, 'yyyy-MM-dd') : undefined);
                                                        setDateToOpen(false);
                                                    }}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>

                                {/* Per Page - Full width */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">Per Page</label>
                                    <Select
                                        value={localFilters.per_page?.toString() || '15'}
                                        onValueChange={(value) => handleFilterChange('per_page', parseInt(value))}
                                    >
                                        <SelectTrigger className="h-9">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="10">10</SelectItem>
                                            <SelectItem value="15">15</SelectItem>
                                            <SelectItem value="25">25</SelectItem>
                                            <SelectItem value="50">50</SelectItem>
                                            <SelectItem value="100">100</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {/* Clear All - Fixed at bottom */}
                        {hasActiveFilters && (
                            <div className="border-t bg-muted/30 p-4">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setLocalFilters({});
                                        onFiltersChange({});
                                        setShowAddFilter(false);
                                    }}
                                    className="w-full text-muted-foreground hover:text-foreground"
                                >
                                    Clear all filters
                                </Button>
                            </div>
                        )}
                    </PopoverContent>
                </Popover>
            </div>

            {/* Second Row: Active Filter Badges */}
            {hasActiveFilters && (
                <div className="flex flex-wrap items-center gap-2">
                    {localFilters.feature && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                            <Zap className="h-3 w-3" />
                            {localFilters.feature}
                            <Button variant="ghost" size="sm" className="ml-1 h-4 w-4 p-0" onClick={() => handleClearFilter('feature')}>
                                <X className="h-2 w-2" />
                            </Button>
                        </Badge>
                    )}

                    {localFilters.action && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                            <Filter className="h-3 w-3" />
                            {localFilters.action}
                            <Button variant="ghost" size="sm" className="ml-1 h-4 w-4 p-0" onClick={() => handleClearFilter('action')}>
                                <X className="h-2 w-2" />
                            </Button>
                        </Badge>
                    )}

                    {localFilters.performed_by && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {availableUsers?.find((u) => u.id === localFilters.performed_by)?.name || 'User'}
                            <Button variant="ghost" size="sm" className="ml-1 h-4 w-4 p-0" onClick={() => handleClearFilter('performed_by')}>
                                <X className="h-2 w-2" />
                            </Button>
                        </Badge>
                    )}

                    {(localFilters.date_from || localFilters.date_to) && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {localFilters.date_from && format(new Date(localFilters.date_from), 'MMM dd')}
                            {localFilters.date_from && localFilters.date_to && ' - '}
                            {localFilters.date_to && format(new Date(localFilters.date_to), 'MMM dd')}
                            <Button
                                variant="ghost"
                                size="sm"
                                className="ml-1 h-4 w-4 p-0"
                                onClick={() => {
                                    handleClearFilter('date_from');
                                    handleClearFilter('date_to');
                                }}
                            >
                                <X className="h-2 w-2" />
                            </Button>
                        </Badge>
                    )}
                </div>
            )}
        </div>
    );
}
