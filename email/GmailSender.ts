import { EmailSender, createMimeEmail } from "./EmailSender";

/**
 * GmailSender - uses OAuth2 to send email via Gmail API
 * Requires a valid access token with the `https://www.googleapis.com/auth/gmail.send` scope
 */
export class GmailSender implements EmailSender {
    constructor(private getAccessToken: () => Promise<string>) {}

    async sendEmail(to: string, subject: string, body: string): Promise<void> {
        const accessToken = await this.getAccessToken();
        const mime = createMimeEmail(to, subject, body);
        const encoded = this.encodeBase64Url(mime);

        const response = await fetch(
            "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ raw: encoded }),
            }
        );

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Gmail send failed: ${response.status} - ${error}`);
        }
    }

    private encodeBase64Url(str: string): string {
        return btoa(unescape(encodeURIComponent(str)))
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=+$/, "");
    }
}
