import { FileText } from 'lucide-react';

interface NoDataProps {
    title?: string;
    description?: string;
    icon?: React.ReactNode;
    className?: string;
}

export function NoData({ 
    title = "No data found", 
    description = "There are no items to display at the moment.",
    icon = <FileText className="h-12 w-12 text-muted-foreground" />,
    className = ""
}: NoDataProps) {
    return (
        <div className={`flex flex-col items-center justify-center py-12 text-center ${className}`}>
            <div className="mb-4">
                {icon}
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
        </div>
    );
}
