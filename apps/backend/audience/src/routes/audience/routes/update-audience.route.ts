import { authMiddleware } from "@reloop/audience/middleware/auth";
import { AudienceModel } from "@reloop/audience/routes/audience/audience.model";
import { updateAudienceHandler } from "@reloop/audience/routes/audience/controllers/update-audience";
import { Elysia, status, t } from "elysia";

export const updateAudienceRoute = new Elysia().use(authMiddleware).put(
    "/audiences/:id",
    async ({ params, body, user }: { params: { id: string }; body: any; user: any }) => {
        if (!user.activeOrganizationId) {
            throw status(403, {
                message: "User is not a member of an organization",
            });
        }
        return await updateAudienceHandler(
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
        body: AudienceModel.updateAudienceBody,
        response: {
            200: AudienceModel.audienceResponse,
            404: AudienceModel.audienceNotFound,
            400: AudienceModel.validationError,
            403: AudienceModel.unauthorized,
        },
        detail: {
            tags: ["Audiences"],
            summary: "Update an audience",
            description: "Updates an existing audience's information",
        },
    },
);
