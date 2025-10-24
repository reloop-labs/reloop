import { authMiddleware } from "@reloop/audience/middleware/auth";
import { AudienceModel } from "@reloop/audience/routes/audience/audience.model";
import { updateAudienceGroupHandler } from "@reloop/audience/routes/audience/controllers/update-audience-group";
import { Elysia, status, t } from "elysia";

export const updateAudienceGroupRoute = new Elysia().use(authMiddleware).put(
    "/audience-groups/:id",
    async ({ params, body, user }: { params: { id: string }; body: any; user: any }) => {
        if (!user.activeOrganizationId) {
            throw status(403, {
                message: "User is not a member of an organization",
            });
        }
        return await updateAudienceGroupHandler(
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
        body: AudienceModel.updateAudienceGroupBody,
        response: {
            200: AudienceModel.audienceGroupResponse,
            404: AudienceModel.audienceGroupNotFound,
            409: AudienceModel.validationError,
            400: AudienceModel.validationError,
            403: AudienceModel.unauthorized,
        },
        detail: {
            tags: ["Audience Groups"],
            summary: "Update an audience group",
            description: "Updates an existing audience group",
        },
    },
);
