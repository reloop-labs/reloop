import { authMiddleware } from "@reloop/audience/middleware/auth";
import { AudienceModel } from "@reloop/audience/routes/audience/audience.model";
import { createAudienceGroupHandler } from "@reloop/audience/routes/audience/controllers/create-audience-group";
import { Elysia, status } from "elysia";

export const createAudienceGroupRoute = new Elysia().use(authMiddleware).post(
    "/audience-groups",
    async ({ body, user }) => {
        if (!user.activeOrganizationId) {
            throw status(403, {
                message: "User is not a member of an organization",
            });
        }
        return await createAudienceGroupHandler(
            user.activeOrganizationId,
            user.id,
            body,
        );
    },
    {
        auth: true,
        body: AudienceModel.createAudienceGroupBody,
        response: {
            201: AudienceModel.audienceGroupResponse,
            409: AudienceModel.validationError,
            400: AudienceModel.validationError,
            403: AudienceModel.unauthorized,
        },
        detail: {
            tags: ["Audience Groups"],
            summary: "Create a new audience group",
            description: "Creates a new audience group for the user's organization",
        },
    },
);
