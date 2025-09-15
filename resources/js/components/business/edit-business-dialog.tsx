import { useEffect, useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Tenant {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  user_count?: number;
}

interface EditBusinessDialogProps {
  open: boolean;
  tenant: Tenant;
  onClose: () => void;
}

export function EditBusinessDialog({ open, tenant, onClose }: EditBusinessDialogProps) {
  const { data, setData, put, processing, errors, reset } = useForm({
    name: tenant.name,
  });

  useEffect(() => {
    if (open) {
      setData('name', tenant.name);
    }
  }, [open, tenant.name]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(route('business.update', tenant.id), {
      onSuccess: () => {
        onClose();
      },
    });
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Business</DialogTitle>
            <DialogDescription>
              Update the name of your business.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Business Name</Label>
              <Input
                id="name"
                value={data.name}
                onChange={(e) => setData('name', e.target.value)}
                placeholder="Enter business name"
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={processing}>
              {processing ? 'Updating...' : 'Update Business'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
