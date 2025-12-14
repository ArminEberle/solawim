export const parseAdditionalEmailReceipients = (raw: string): string[] => {
    if (typeof raw !== 'string' || raw.trim().length === 0) {
        return [];
    }

    const uniqueMap: Record<string, string> = {};
    raw.split(/[\n,;]+/)
        .map(entry => entry.trim())
        .filter(entry => entry.length > 0)
        .forEach(email => {
            const lower = email.toLowerCase();
            if (!uniqueMap[lower]) {
                uniqueMap[lower] = email;
            }
        });

    return Object.values(uniqueMap);
};

export const sanitizeAdditionalEmailReceipients = (emails: string[]): string[] => {
    if (!Array.isArray(emails) || emails.length === 0) {
        return [];
    }

    const uniqueMap: Record<string, string> = {};
    emails
        .map(email => (typeof email === 'string' ? email.trim() : ''))
        .filter(email => email.length > 0)
        .forEach(email => {
            const lower = email.toLowerCase();
            if (!uniqueMap[lower]) {
                uniqueMap[lower] = email;
            }
        });

    return Object.values(uniqueMap);
};
