/**
 * Format a date string to a human-readable format like "20 May 2025"
 */
export function formatDate(dateString: string): string {
    const date = new Date(dateString);

    return date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: '2-digit',
    });
}
