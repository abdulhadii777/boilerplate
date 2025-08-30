import { useState, useCallback } from 'react';
import { NewRole } from '../types';

export function useRoleForm() {
    const [formData, setFormData] = useState<NewRole>({
        name: '',
        display_name: '',
        description: '',
        permissions: [],
    });

    const [loading, setLoading] = useState(false);

    const updateFormField = useCallback((field: keyof NewRole, value: string | string[]) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }));
    }, []);

    const handlePermissionChange = useCallback((permissionName: string, checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            permissions: checked
                ? [...prev.permissions, permissionName]
                : prev.permissions.filter(p => p !== permissionName),
        }));
    }, []);

    const resetForm = useCallback(() => {
        setFormData({
            name: '',
            display_name: '',
            description: '',
            permissions: [],
        });
    }, []);

    const isFormValid = useCallback(() => {
        return formData.name.trim() !== '' && formData.display_name.trim() !== '';
    }, [formData.name, formData.display_name]);

    const setLoadingState = useCallback((loading: boolean) => {
        setLoading(loading);
    }, []);

    return {
        formData,
        loading,
        updateFormField,
        handlePermissionChange,
        resetForm,
        isFormValid,
        setLoadingState,
    };
}
