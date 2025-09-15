import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface Tenant {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  user_count?: number;
}

interface DeleteBusinessDialogProps {
  open: boolean;
  tenant: Tenant;
  onClose: () => void;
}

export function DeleteBusinessDialog({ open, tenant, onClose }: DeleteBusinessDialogProps) {
  const { delete: destroy, processing } = useForm();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    destroy(route('business.destroy', tenant.id), {
      onSuccess: () => {
        onClose();
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <DialogTitle>Delete Business</DialogTitle>
            </div>
            <DialogDescription>
              Are you sure you want to delete <strong>"{tenant.name}"</strong>? This action cannot be undone.
              All data associated with this business will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="destructive" disabled={processing}>
              {processing ? 'Deleting...' : 'Delete Business'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
