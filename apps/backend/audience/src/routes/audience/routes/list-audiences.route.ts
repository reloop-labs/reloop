import { authMiddleware } from "@reloop/audience/middleware/auth";
import { AudienceModel } from "@reloop/audience/routes/audience/audience.model";
import { listAudiencesHandler } from "@reloop/audience/routes/audience/controllers/list-audiences";
import { Elysia, status } from "elysia";

export const listAudiencesRoute = new Elysia().use(authMiddleware).get(
    "/audience",
    async ({ query, user }) => {
        if (!user.activeOrganizationId) {
            throw status(403, {
                message: "User is not a member of an organization",
            });
        }
        return await listAudiencesHandler(user.activeOrganizationId, query);
    },
    {
        auth: true,
        query: AudienceModel.audienceQuery,
        response: {
            200: AudienceModel.audienceListResponse,
            403: AudienceModel.unauthorized,
        },
        detail: {
            tags: ["Audience"],
            summary: "List audiences",
            description:
                "Retrieves a paginated list of audiences with optional filtering and search",
        },
    },
);
