import { authMiddleware } from "@reloop/audience/middleware/auth";
import { AudienceModel } from "@reloop/audience/routes/audience/audience.model";
import { unsubscribeAudienceHandler } from "@reloop/audience/routes/audience/controllers/unsubscribe-audience";
import type { User } from "@reloop/auth/server";
import { Elysia, status, t } from "elysia";

export const unsubscribeAudienceRoute = new Elysia().use(authMiddleware).post(
    "/unsubscribe/:id",
    async ({
        params,
        body,
        user,
    }: {
        params: { id: string };
        body: AudienceModel.UnsubscribeAudienceBody;
        user: User;
    }) => {
        if (!user.activeOrganizationId) {
            throw status(403, {
                message: "User is not a member of an organization",
            });
        }
        return await unsubscribeAudienceHandler(
            params.id,
            user.activeOrganizationId,
            body,
        );
    },
    {
        auth: true,
        params: t.Object({
            id: t.String(),
        }),
        body: AudienceModel.unsubscribeAudienceBody,
        response: {
            200: AudienceModel.audienceResponse,
            404: AudienceModel.audienceNotFound,
            403: AudienceModel.unauthorized,
        },
        detail: {
            tags: ["Audience"],
            summary: "Unsubscribe an audience",
            description: "Changes an audience's status to unsubscribed",
        },
    },
);
