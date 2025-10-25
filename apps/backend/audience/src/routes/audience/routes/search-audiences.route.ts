import { authMiddleware } from "@reloop/audience/middleware/auth";
import { AudienceModel } from "@reloop/audience/routes/audience/audience.model";
import { searchAudiencesHandler } from "@reloop/audience/routes/audience/controllers/search-audiences";
import { Elysia, status } from "elysia";

export const searchAudiencesRoute = new Elysia().use(authMiddleware).get(
    "/search",
    async ({ query, user }) => {
        if (!user.activeOrganizationId) {
            throw status(403, {
                message: "User is not a member of an organization",
            });
        }
        return await searchAudiencesHandler(user.activeOrganizationId, query);
    },
    {
        auth: true,
        query: AudienceModel.searchAudiencesQuery,
        response: {
            200: AudienceModel.audienceListResponse,
            403: AudienceModel.unauthorized,
        },
        detail: {
            tags: ["Audience"],
            summary: "Search audiences",
            description:
                "Performs advanced search across audience fields including metadata",
        },
    },
);
