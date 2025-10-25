import { authMiddleware } from "@reloop/audience/middleware/auth";
import { AudienceModel } from "@reloop/audience/routes/audience/audience.model";
import { subscribeAudienceHandler } from "@reloop/audience/routes/audience/controllers/subscribe-audience";
import { Elysia, status, t } from "elysia";

export const subscribeAudienceRoute = new Elysia().use(authMiddleware).post(
    "/audiences/:id/subscribe",
    async ({ params, body, user }: { params: { id: string }; body: any; user: any }) => {
        if (!user.activeOrganizationId) {
            throw status(403, {
                message: "User is not a member of an organization",
            });
        }
        return await subscribeAudienceHandler(
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
        body: AudienceModel.subscribeAudienceBody,
        response: {
            200: AudienceModel.audienceResponse,
            404: AudienceModel.audienceNotFound,
            403: AudienceModel.unauthorized,
        },
        detail: {
            tags: ["Audience"],
            summary: "Subscribe an audience",
            description: "Changes an audience's status to subscribed",
        },
    },
);
