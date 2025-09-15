import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical, Edit, Trash2, Users, Star } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';

interface Tenant {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  user_count?: number;
  is_favorite?: boolean;
}

interface BusinessCardProps {
  tenant: Tenant;
  onSwitch: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function BusinessCard({ tenant, onSwitch, onEdit, onDelete }: BusinessCardProps) {
  const toggleFavoriteForm = useForm({});

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavoriteForm.post(route('business.toggle-favorite', tenant.id), {
      preserveState: false,
      preserveScroll: false,
    });
  };

  return (
    <Card className={`relative transition-all hover:shadow-md ${tenant.is_favorite ? 'ring-2 ring-yellow-400' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">{tenant.name}</CardTitle>
              {tenant.is_favorite && (
                <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                  <Star className="h-3 w-3 mr-1 fill-current" />
                  Favorite
                </Badge>
              )}
            </div>
            <CardDescription>
              Created {formatDistanceToNow(new Date(tenant.created_at), { addSuffix: true })}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleFavorite}
              disabled={toggleFavoriteForm.processing}
              className="h-8 w-8 p-0"
            >
              <Star className={`h-4 w-4 ${
                tenant.is_favorite 
                  ? 'fill-yellow-400 text-yellow-400' 
                  : 'text-muted-foreground hover:text-yellow-400'
              }`} />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDelete} className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-muted-foreground">
            <Users className="mr-1 h-4 w-4" />
            <span>{tenant.user_count || 0} users</span>
          </div>
          <Button
            onClick={onSwitch}
            variant="default"
            size="sm"
          >
            Switch
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
