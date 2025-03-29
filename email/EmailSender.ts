// Interface to support multiple email backends (Gmail, SMTP, Outlook, etc.)
export interface EmailSender {
    sendEmail(to: string, subject: string, body: string): Promise<void>;
}

// Utility to help format MIME-compliant email body (if needed later)
export function createMimeEmail(
    to: string,
    subject: string,
    body: string
): string {
    return [
        `To: ${to}`,
        `Subject: ${subject}`,
        'Content-Type: text/plain; charset="UTF-8"',
        "",
        body,
    ].join("\r\n");
}
