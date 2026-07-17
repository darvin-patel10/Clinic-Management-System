import jwt from "jsonwebtoken";
import crypto from "crypto";
import config from "../config/config.js";
import sessionModel from "../models/session.model.js";
import userModel from "../models/user.model.js";

/**
 * Protect any route by placing this middleware before the route handler.
 *
 * What it does:
 *  1. Reads the access token from "Authorization: Bearer <token>" header
 *  2. Verifies the JWT signature and expiry
 *  3. If the access token is EXPIRED — silently refreshes it using the
 *     refreshToken cookie (if present and valid) and issues a new access
 *     token in the "X-New-Access-Token" response header.
 *  4. Checks the session still exists and has not been revoked (logout guard)
 *  5. Attaches `req.user` and `req.sessionId` for downstream handlers
 *
 * If any check fails it responds with 401 — the route handler is never called.
 */
export async function authenticate(req, res, next) {
    try {
        // ── 1. Extract access token ───────────────────────────────────────
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Access token is required"
            });
        }

        const token = authHeader.split(" ")[1];

        // ── 2. Verify access token ────────────────────────────────────────
        let decoded;
        try {
            decoded = jwt.verify(token, config.JWT_SECRET);
        } catch (err) {
            if (err.name !== "TokenExpiredError") {
                // Genuinely invalid token (tampered / wrong secret)
                return res.status(401).json({ message: "Invalid access token." });
            }

            // ── 3. Access token EXPIRED — attempt silent refresh ──────────
            const refreshToken = req.cookies?.refreshToken;

            if (!refreshToken) {
                return res.status(401).json({
                    message: "Access token expired. Please log in again."
                });
            }

            // Verify the refresh token
            let refreshDecoded;
            try {
                refreshDecoded = jwt.verify(refreshToken, config.JWT_SECRET);
            } catch {
                return res.status(401).json({
                    message: "Session expired. Please log in again."
                });
            }

            // Check session is active and not revoked
            const refreshTokenHash = crypto
                .createHash("sha256")
                .update(refreshToken)
                .digest("hex");

            const session = await sessionModel.findOne({
                refreshTokenHash,
                revoked: false
            });

            if (!session) {
                return res.status(401).json({
                    message: "Session has been revoked. Please log in again."
                });
            }

            // Issue a new access token
            const newAccessToken = jwt.sign(
                { id: refreshDecoded.id, sessionId: session._id },
                config.JWT_SECRET,
                { expiresIn: "15m" }
            );

            // Send the new token in a response header so the client can save it
            res.setHeader("X-New-Access-Token", newAccessToken);

            // Use the refresh-decoded payload to continue the request
            decoded = { id: refreshDecoded.id, sessionId: session._id };
        }

        // ── 4. Check session is active (catches post-logout replays) ──────
        const session = await sessionModel.findOne({
            _id: decoded.sessionId,
            revoked: false
        });

        if (!session) {
            return res.status(401).json({
                message: "Session has been revoked. Please log in again."
            });
        }

        // ── 5. Attach user to request ─────────────────────────────────────
        const user = await userModel.findById(decoded.id).select("-password");

        if (!user) {
            return res.status(401).json({ message: "User no longer exists." });
        }

        req.user = user;
        req.sessionId = decoded.sessionId;

        next(); // ✅ all checks passed

    } catch (error) {
        console.error("[Auth Middleware] Unexpected error:", error);
        return res.status(500).json({
            message: "Internal server error during authentication"
        });
    }
}
