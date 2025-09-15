import { type MainPageProps } from '@/types';
import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';

export function useFlashMessages() {
    const { flash } = usePage<MainPageProps>().props;

    useEffect(() => {
        if (flash.success) {
            toast.success(flash.success);
        }
    }, [flash.success]);

    useEffect(() => {
        if (flash.error) {
            toast.error(flash.error);
        }
    }, [flash.error]);
}
