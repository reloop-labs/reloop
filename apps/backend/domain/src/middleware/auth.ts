import { auth } from "@reloop/auth/server";
import { logger } from "@reloop/logger";
import { Elysia } from "elysia";

export const authMiddleware = new Elysia({ name: "better-auth" })
    .macro({
        auth: {
            async resolve({ status, request: { headers } }) {
                try {
                    const session = await auth.api.getSession({ headers });
                    if (session) {
                        logger.info("User authenticated via cookie", { userId: session.user.id, });
                        return {
                            user: session.user,
                            session: session.session,
                            authMethod: "cookie" as const,
                        };
                    }
                    const apiKey =
                        headers.get("x-api-key") ||
                        headers.get("authorization")?.replace("Bearer ", "");
                    if (apiKey) {
                        const apiKeySession = await auth.api.getSession({
                            headers: new Headers({
                                authorization: `Bearer ${apiKey}`,
                            }),
                        });

                        if (apiKeySession) {
                            logger.info("User authenticated via API key", { userId: apiKeySession.user.id, });
                            return {
                                user: apiKeySession.user,
                                session: apiKeySession.session,
                                authMethod: "apiKey" as const,
                            };
                        }
                    }
                    return status(401, "Authentication required");
                } catch (error) {
                    logger.error("Authentication error", {
                        error: error instanceof Error ? error.message : "Unknown error",
                    });
                    return status(401, "Authentication failed");
                }
            }
        }
    });
