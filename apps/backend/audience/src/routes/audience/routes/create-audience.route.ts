import { authMiddleware } from "@reloop/audience/middleware/auth";
import { AudienceModel } from "@reloop/audience/routes/audience/audience.model";
import { AudienceGroupModel } from "@reloop/audience/routes/audience-group/audience-group.model";
import { createAudienceHandler } from "@reloop/audience/routes/audience/controllers/create-audience";
import { Elysia, status } from "elysia";

export const createAudienceRoute = new Elysia().use(authMiddleware).post(
    "/audiences",
    async ({ body, user }) => {
        if (!user.activeOrganizationId) {
            throw status(403, {
                message: "User is not a member of an organization",
            });
        }
        return await createAudienceHandler(user.activeOrganizationId, body);
    },
    {
        auth: true,
        body: AudienceModel.createAudienceBody,
        response: {
            201: AudienceModel.audienceResponse,
            409: AudienceModel.audienceAlreadyExists,
            404: AudienceGroupModel.audienceGroupNotFound,
            400: AudienceModel.invalidEmail,
            403: AudienceModel.unauthorized,
        },
        detail: {
            tags: ["Audiences"],
            summary: "Create a new audience",
            description: "Adds a new audience to an audience group",
        },
    },
);
