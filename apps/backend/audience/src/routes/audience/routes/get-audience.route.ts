import { authMiddleware } from "@reloop/audience/middleware/auth";
import { AudienceModel } from "@reloop/audience/routes/audience/audience.model";
import { getAudienceHandler } from "@reloop/audience/routes/audience/controllers/get-audience";
import { Elysia, status, t } from "elysia";

export const getAudienceRoute = new Elysia().use(authMiddleware).get(
    "/audiences/:id",
    async ({ params, user }: { params: { id: string }; user: any }) => {
        if (!user.activeOrganizationId) {
            throw status(403, {
                message: "User is not a member of an organization",
            });
        }
        return await getAudienceHandler(params.id, user.activeOrganizationId);
    },
    {
        auth: true,
        params: t.Object({
            id: t.String(),
        }),
        response: {
            200: AudienceModel.audienceResponse,
            404: AudienceModel.audienceNotFound,
            403: AudienceModel.unauthorized,
        },
        detail: {
            tags: ["Audiences"],
            summary: "Get an audience",
            description: "Retrieves a specific audience by ID",
        },
    },
);
