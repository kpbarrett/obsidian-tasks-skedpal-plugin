import { Notice, requestUrl } from "obsidian";
import * as http from "http";

interface GmailOAuthToken {
    access_token: string;
    refresh_token?: string;
    expires_at: number;
}

const CLIENT_ID = "<YOUR_CLIENT_ID_HERE>";
const REDIRECT_URI = "http://localhost:8282";
const SCOPE = "https://www.googleapis.com/auth/gmail.send";
const TOKEN_STORAGE_KEY = "gmail-oauth-token";

export class GmailAuth {
    constructor(
        private plugin: {
            loadData: () => Promise<any>;
            saveData: (data: any) => Promise<void>;
        }
    ) {}

    async getAccessToken(): Promise<string> {
        let token: GmailOAuthToken | undefined = await this.loadToken();

        if (token && token.expires_at > Date.now() + 60 * 1000) {
            return token.access_token;
        } else if (token?.refresh_token) {
            return this.refreshToken(token.refresh_token);
        } else {
            return this.startOAuthFlow();
        }
    }

    private async startOAuthFlow(): Promise<string> {
        const authUrl =
            `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${CLIENT_ID}` +
            `&redirect_uri=${encodeURIComponent(
                REDIRECT_URI
            )}&scope=${encodeURIComponent(
                SCOPE
            )}&access_type=offline&prompt=consent`;

        new Notice("Opening browser for Gmail authorization…");
        window.open(authUrl);

        try {
            const code = await this.listenForOAuthCode();
            return await this.exchangeCodeForToken(code);
        } catch (err) {
            console.warn(
                "Auto-capture failed or disabled. Falling back to manual code entry.",
                err
            );
            const code = await this.promptForManualCode();
            return await this.exchangeCodeForToken(code);
        }
    }

    private listenForOAuthCode(): Promise<string> {
        return new Promise((resolve, reject) => {
            const server = http.createServer((req, res) => {
                const url = new URL(req.url || "", REDIRECT_URI);
                const code = url.searchParams.get("code");
                if (code) {
                    res.writeHead(200, { "Content-Type": "text/html" });
                    res.end(
                        "<html><body><h1>Authorization complete</h1><p>You may now close this window.</p></body></html>"
                    );
                    server.close();
                    resolve(code);
                } else {
                    res.writeHead(400);
                    res.end("Missing authorization code.");
                    reject(new Error("Missing code in redirect."));
                }
            });

            server.listen(8282, () => {
                console.log("Listening for OAuth code on port 8282…");
            });

            server.on("error", (err) => reject(err));

            // Timeout after 2 minutes
            setTimeout(() => {
                server.close();
                reject(new Error("Timed out waiting for OAuth code."));
            }, 120_000);
        });
    }

    private async promptForManualCode(): Promise<string> {
        const code = window.prompt("Paste the Gmail authorization code:");
        if (!code) throw new Error("No code entered.");
        return code.trim();
    }

    private async exchangeCodeForToken(code: string): Promise<string> {
        const res = await requestUrl({
            method: "POST",
            url: "https://oauth2.googleapis.com/token",
            body: new URLSearchParams({
                client_id: CLIENT_ID,
                code,
                grant_type: "authorization_code",
                redirect_uri: REDIRECT_URI,
            }).toString(),
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });

        const data = res.json;
        const token: GmailOAuthToken = {
            access_token: data.access_token,
            refresh_token: data.refresh_token,
            expires_at: Date.now() + data.expires_in * 1000,
        };
        await this.saveToken(token);
        return token.access_token;
    }

    private async refreshToken(refreshToken: string): Promise<string> {
        const res = await requestUrl({
            method: "POST",
            url: "https://oauth2.googleapis.com/token",
            body: new URLSearchParams({
                client_id: CLIENT_ID,
                grant_type: "refresh_token",
                refresh_token,
            }).toString(),
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });

        const data = res.json;
        const newToken: GmailOAuthToken = {
            access_token: data.access_token,
            refresh_token: refreshToken,
            expires_at: Date.now() + data.expires_in * 1000,
        };
        await this.saveToken(newToken);
        return newToken.access_token;
    }

    private async loadToken(): Promise<GmailOAuthToken | undefined> {
        const data = await this.plugin.loadData();
        return data?.[TOKEN_STORAGE_KEY];
    }

    private async saveToken(token: GmailOAuthToken): Promise<void> {
        const data = (await this.plugin.loadData()) || {};
        data[TOKEN_STORAGE_KEY] = token;
        await this.plugin.saveData(data);
    }
}
