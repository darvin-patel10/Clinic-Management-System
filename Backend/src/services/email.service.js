import nodemailer from "nodemailer";
import https from "https";
import querystring from "querystring";
import config from "../config/config.js";

// ---------------------------------------------------------------------------
// OAuth2 Token Manager
// Handles fetching a fresh access token from Google using the refresh token.
// Caches the token in memory and only refreshes when it is about to expire.
// This is the correct pattern — access tokens expire after 1 hour; the
// refresh token is long-lived but must NOT be confused with an access token.
// ---------------------------------------------------------------------------

const tokenCache = {
    accessToken: null,
    expiresAt: 0, // Unix timestamp in ms
};

/**
 * Exchange the refresh token for a new access token using Google's token endpoint.
 * Uses Node's built-in `https` module — no extra dependency needed.
 *
 * @returns {Promise<string>} A valid access token
 */
async function getAccessToken() {
    const EXPIRY_BUFFER_MS = 5 * 60 * 1000; // refresh 5 minutes before expiry

    // Return cached token if it is still valid
    if (tokenCache.accessToken && Date.now() < tokenCache.expiresAt - EXPIRY_BUFFER_MS) {
        return tokenCache.accessToken;
    }

    console.log("[EmailService] Refreshing OAuth2 access token...");

    const postData = querystring.stringify({
        client_id: config.GOOGLE_CLIENT_ID,
        client_secret: config.GOOGLE_CLIENT_SECRET,
        refresh_token: config.GOOGLE_REFRESH_TOKEN,
        grant_type: "refresh_token",
    });

    return new Promise((resolve, reject) => {
        const options = {
            hostname: "oauth2.googleapis.com",
            path: "/token",
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Content-Length": Buffer.byteLength(postData),
            },
        };

        const req = https.request(options, (res) => {
            let data = "";
            res.on("data", (chunk) => (data += chunk));
            res.on("end", () => {
                try {
                    const parsed = JSON.parse(data);

                    if (parsed.error) {
                        // Provide an actionable error message for the most common failure
                        const hint =
                            parsed.error === "invalid_grant"
                                ? " → The refresh token is expired or revoked. " +
                                "Generate a new one at https://developers.google.com/oauthplayground " +
                                "with scope 'https://mail.google.com/' and update GOOGLE_REFRESH_TOKEN in .env. " +
                                "If the OAuth Consent Screen is in Testing mode, tokens expire after 7 days."
                                : "";
                        return reject(
                            new Error(
                                `[EmailService] Token refresh failed: ${parsed.error} — ${parsed.error_description}${hint}`
                            )
                        );
                    }

                    // Cache the new token
                    tokenCache.accessToken = parsed.access_token;
                    // expires_in is in seconds; convert to ms absolute timestamp
                    tokenCache.expiresAt = Date.now() + parsed.expires_in * 1000;

                    console.log(
                        `[EmailService] Access token refreshed successfully. ` +
                        `Expires in ${Math.round(parsed.expires_in / 60)} minutes.`
                    );
                    resolve(parsed.access_token);
                } catch (e) {
                    reject(new Error(`[EmailService] Failed to parse token response: ${e.message}`));
                }
            });
        });

        req.on("error", (e) => {
            reject(new Error(`[EmailService] Network error during token refresh: ${e.message}`));
        });

        req.write(postData);
        req.end();
    });
}

// ---------------------------------------------------------------------------
// Transporter Factory
// Creates a fresh Nodemailer transporter with a valid access token each time.
// This is safer than a static singleton because it avoids stale token issues.
// ---------------------------------------------------------------------------

/**
 * Create a Nodemailer transporter authenticated with a fresh OAuth2 access token.
 *
 * @returns {Promise<import("nodemailer").Transporter>}
 */
async function createTransporter() {
    const accessToken = await getAccessToken();

    return nodemailer.createTransport({
        service: "gmail",
        auth: {
            type: "OAuth2",
            user: config.GOOGLE_USER,
            clientId: config.GOOGLE_CLIENT_ID,
            clientSecret: config.GOOGLE_CLIENT_SECRET,
            refreshToken: config.GOOGLE_REFRESH_TOKEN,
            accessToken, // Providing a fresh access token avoids Nodemailer's own (often broken) refresh logic
        },
    });
}

// ---------------------------------------------------------------------------
// Startup Diagnostic
// Verifies connectivity at startup WITHOUT crashing the server.
// A healthy email server is desirable but not a hard dependency for startup.
// ---------------------------------------------------------------------------

async function verifyEmailConnection() {
    console.log("[EmailService] Running startup email connectivity check...");
    try {
        const transporter = await createTransporter();
        await transporter.verify();
        console.log("[EmailService] ✅ Email server is ready to send messages.");
    } catch (error) {
        // Log clearly but do NOT throw — the server should still start.
        // Email failures should be handled per-request, not at startup.
        console.error("[EmailService] ⚠️  Email server connectivity check failed.");
        console.error("[EmailService] Error:", error.message);
        console.error(
            "[EmailService] The server will continue to start. " +
            "Email sending will fail until the issue is resolved."
        );
    }
}

// Run the check asynchronously at module load — does not block startup
verifyEmailConnection();

// ---------------------------------------------------------------------------
// sendEmail — Public API
// Sends an email with automatic token refresh and a retry on transient errors.
// ---------------------------------------------------------------------------

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;

/**
 * Send an email via Gmail using OAuth2.
 *
 * @param {string}  to       - Recipient email address
 * @param {string}  subject  - Email subject line
 * @param {string}  text     - Plain-text body (fallback)
 * @param {string}  html     - HTML body
 * @returns {Promise<import("nodemailer").SentMessageInfo>}
 */
export async function sendEmail(to, subject, text, html) {
    let lastError;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            console.log(
                `[EmailService] Sending email to "${to}" | Subject: "${subject}" | Attempt ${attempt}/${MAX_RETRIES}`
            );

            // Invalidate the cached token on retry so a fresh one is fetched
            if (attempt > 1) {
                tokenCache.accessToken = null;
                tokenCache.expiresAt = 0;
                console.log(`[EmailService] Retry ${attempt}: invalidating cached token and refreshing...`);
                await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
            }

            const transporter = await createTransporter();

            const info = await transporter.sendMail({
                from: `"Clinic Management System" <${config.GOOGLE_USER}>`,
                to,
                subject,
                text,
                html,
            });

            console.log(
                `[EmailService] ✅ Email sent successfully to "${to}". MessageId: ${info.messageId}`
            );
            return info;
        } catch (error) {
            lastError = error;
            console.error(
                `[EmailService] ❌ Attempt ${attempt}/${MAX_RETRIES} failed: ${error.message}`
            );

            // Do not retry on authentication errors — they will not resolve with retries
            const isAuthError =
                error.code === "EAUTH" ||
                (error.message && error.message.includes("invalid_grant"));

            if (isAuthError) {
                console.error(
                    "[EmailService] Authentication error detected. " +
                    "Retrying will not help. The refresh token may be expired or revoked. " +
                    "Please generate a new token and update GOOGLE_REFRESH_TOKEN in .env."
                );
                break;
            }
        }
    }

    console.error(`[EmailService] All ${MAX_RETRIES} attempts failed. Last error: ${lastError?.message}`);
    throw lastError;
}