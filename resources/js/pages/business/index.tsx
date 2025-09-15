import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Plus, Building2 } from 'lucide-react';
import { BusinessCard } from '@/components/business/business-card';
import { EditBusinessDialog } from '@/components/business/edit-business-dialog';
import { DeleteBusinessDialog } from '@/components/business/delete-business-dialog';
import { CreateBusinessDialog } from '@/components/business/create-business-dialog';
import AppLayout from '@/layouts/app-layout';

interface Tenant {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  user_count?: number;
  is_favorite?: boolean;
}

interface BusinessIndexProps {
  tenants: Tenant[];
}

export default function BusinessIndex({ tenants }: BusinessIndexProps) {
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [deletingTenant, setDeletingTenant] = useState<Tenant | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const switchForm = useForm({
    tenant_id: '',
  });

  const handleSwitch = (tenantId: string) => {
    switchForm.post(route('business.switch', tenantId), {
      method: 'post',
    });
  };

  const handleEdit = (tenant: Tenant) => {
    setEditingTenant(tenant);
  };

  const handleDelete = (tenant: Tenant) => {
    setDeletingTenant(tenant);
  };

  const handleCloseEdit = () => {
    setEditingTenant(null);
  };

  const handleCloseDelete = () => {
    setDeletingTenant(null);
  };

  const handleCloseCreate = () => {
    setShowCreateDialog(false);
  };

  return (
    <>
      <Head title="Business" />
      
      <div className="flex-1 space-y-8 p-4 pt-8 max-w-5xl mx-auto">         
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Business</h1>
            <p className="text-muted-foreground">
              Manage your businesses and switch between them
            </p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Business
          </Button>
        </div>

        {tenants.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <CardTitle className="mb-2">No businesses yet</CardTitle>
              <CardDescription className="mb-4">
                Create your first business to get started
              </CardDescription>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Business
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tenants.map((tenant) => (
              <BusinessCard
                key={tenant.id}
                tenant={tenant}
                onSwitch={() => handleSwitch(tenant.id)}
                onEdit={() => handleEdit(tenant)}
                onDelete={() => handleDelete(tenant)}
              />
            ))}
          </div>
        )}

        {/* Create Business Dialog */}
        <CreateBusinessDialog
          open={showCreateDialog}
          onClose={handleCloseCreate}
        />

        {/* Edit Business Dialog */}
        {editingTenant && (
          <EditBusinessDialog
            open={!!editingTenant}
            tenant={editingTenant}
            onClose={handleCloseEdit}
          />
        )}

        {/* Delete Business Dialog */}
        {deletingTenant && (
          <DeleteBusinessDialog
            open={!!deletingTenant}
            tenant={deletingTenant}
            onClose={handleCloseDelete}
          />
        )}
      </div>
    </>
  );
}
