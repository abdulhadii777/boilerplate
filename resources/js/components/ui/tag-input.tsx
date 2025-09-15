import { useState, KeyboardEvent, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface TagInputProps {
    value: string[];
    onChange: (value: string[]) => void;
    placeholder?: string;
    className?: string;
    error?: string;
}

export function TagInput({ value, onChange, placeholder = "Type and press Enter", className, error }: TagInputProps) {
    const [inputValue, setInputValue] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const addTag = (email: string) => {
        const trimmedEmail = email.trim();
        if (trimmedEmail && !value.includes(trimmedEmail)) {
            onChange([...value, trimmedEmail]);
        }
        setInputValue('');
    };

    const removeTag = (index: number) => {
        onChange(value.filter((_, i) => i !== index));
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTag(inputValue);
        } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
            removeTag(value.length - 1);
        }
    };

    const handleBlur = () => {
        if (inputValue.trim()) {
            addTag(inputValue);
        }
    };

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const getTagVariant = (email: string): 'default' | 'destructive' | 'secondary' => {
        if (!validateEmail(email)) {
            return 'destructive';
        }
        return 'default';
    };

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    return (
        <div className={cn("space-y-2", className)}>
            <div className={cn(
                "flex flex-wrap gap-2 p-2 border rounded-md min-h-[42px]",
                error ? "border-destructive" : "border-input",
                "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
            )}>
                {value.map((email, index) => (
                    <Badge
                        key={index}
                        variant={getTagVariant(email)}
                        className="flex items-center gap-1 px-2 py-1"
                    >
                        {email}
                        <button
                            type="button"
                            onClick={() => removeTag(index)}
                            className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </Badge>
                ))}
                <Input
                    ref={inputRef}
                    type="email"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={handleBlur}
                    placeholder={value.length === 0 ? placeholder : "Add another email..."}
                    className="border-0 p-0 h-6 min-w-[120px] focus-visible:ring-0 focus-visible:ring-offset-0"
                />
            </div>
            {error && (
                <p className="text-sm text-destructive">{error}</p>
            )}
            <p className="text-xs text-muted-foreground">
                Press Enter to add each email address
            </p>
        </div>
    );
}
