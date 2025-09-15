import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface Permission {
    id: number;
    name: string;
    guard_name: string;
}

interface Props {
    permissions: Permission[];
    selectedPermissions: string[];
    onPermissionsChange: (permissions: string[]) => void;
    error?: string;
}

export function PermissionSelector({ permissions, selectedPermissions, onPermissionsChange, error }: Props) {
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

    // Group permissions by feature (e.g., "User", "Role", etc.)
    const groupedPermissions = permissions.reduce(
        (groups, permission) => {
            const feature = permission.name.split(' ')[1] || 'Other'; // Extract feature from "Action Feature" format
            if (!groups[feature]) {
                groups[feature] = [];
            }
            groups[feature].push(permission);
            return groups;
        },
        {} as Record<string, Permission[]>,
    );

    const toggleGroup = (group: string) => {
        const newExpanded = new Set(expandedGroups);
        if (newExpanded.has(group)) {
            newExpanded.delete(group);
        } else {
            newExpanded.add(group);
        }
        setExpandedGroups(newExpanded);
    };

    const handlePermissionToggle = (permissionName: string, checked: boolean) => {
        const newPermissions = checked ? [...selectedPermissions, permissionName] : selectedPermissions.filter((p) => p !== permissionName);
        onPermissionsChange(newPermissions);
    };

    const handleSelectAllInGroup = (group: string, checked: boolean) => {
        const groupPermissions = groupedPermissions[group].map((p) => p.name);
        const newPermissions = checked
            ? [...selectedPermissions.filter((p) => !groupPermissions.includes(p)), ...groupPermissions]
            : selectedPermissions.filter((p) => !groupPermissions.includes(p));
        onPermissionsChange(newPermissions);
    };

    const isGroupSelected = (group: string) => {
        const groupPermissions = groupedPermissions[group].map((p) => p.name);
        return groupPermissions.every((p) => selectedPermissions.includes(p));
    };

    const isGroupPartiallySelected = (group: string) => {
        const groupPermissions = groupedPermissions[group].map((p) => p.name);
        const selectedCount = groupPermissions.filter((p) => selectedPermissions.includes(p)).length;
        return selectedCount > 0 && selectedCount < groupPermissions.length;
    };

    return (
        <div className="space-y-4">
            {Object.entries(groupedPermissions).map(([group, groupPermissions]) => {
                const isExpanded = expandedGroups.has(group);
                const isSelected = isGroupSelected(group);
                const isPartiallySelected = isGroupPartiallySelected(group);

                return (
                    <Card key={group}>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Button type="button" variant="ghost" size="sm" onClick={() => toggleGroup(group)} className="h-6 w-6 p-0">
                                        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                    </Button>
                                    <CardTitle className="text-base">{group}</CardTitle>
                                    <Badge variant="secondary">{groupPermissions.length}</Badge>
                                </div>
                                <Checkbox
                                    checked={isSelected}
                                    ref={(ref) => {
                                        if (ref instanceof HTMLInputElement) {
                                            ref.indeterminate = isPartiallySelected;
                                        }
                                    }}
                                    onCheckedChange={(checked) => handleSelectAllInGroup(group, checked as boolean)}
                                />
                            </div>
                        </CardHeader>

                        {isExpanded && (
                            <CardContent className="pt-0">
                                <div className="grid grid-cols-2 gap-3 pl-6">
                                    {groupPermissions.map((permission) => (
                                        <div key={permission.id} className="flex items-center gap-2">
                                            <Checkbox
                                                id={`permission-${permission.id}`}
                                                checked={selectedPermissions.includes(permission.name)}
                                                onCheckedChange={(checked) => handlePermissionToggle(permission.name, checked as boolean)}
                                            />
                                            <label htmlFor={`permission-${permission.id}`} className="cursor-pointer text-sm font-normal">
                                                {permission.name}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        )}
                    </Card>
                );
            })}

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="text-sm text-muted-foreground">Selected: {selectedPermissions.length} permissions</div>
        </div>
    );
}
