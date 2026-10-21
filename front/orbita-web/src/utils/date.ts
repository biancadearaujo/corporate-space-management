export function parseApiDate(dateString: string): Date {
    if (!dateString.endsWith('Z')) {
        return new Date(dateString + 'Z');
    }
    return new Date(dateString);
}
