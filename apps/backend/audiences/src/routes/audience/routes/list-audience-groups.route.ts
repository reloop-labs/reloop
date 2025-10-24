import { authMiddleware } from "@reloop/audience/middleware/auth";
import { AudienceModel } from "@reloop/audience/routes/audience/audience.model";
import { listAudienceGroupsHandler } from "@reloop/audience/routes/audience/controllers/list-audience-groups";
import { Elysia, status } from "elysia";

export const listAudienceGroupsRoute = new Elysia().use(authMiddleware).get(
    "/audience-groups",
    async ({ query, user }) => {
        if (!user.activeOrganizationId) {
            throw status(403, {
                message: "User is not a member of an organization",
            });
        }
        return await listAudienceGroupsHandler(user.activeOrganizationId, query);
    },
    {
        auth: true,
        query: AudienceModel.audienceGroupQuery,
        response: {
            200: AudienceModel.audienceGroupListResponse,
            403: AudienceModel.unauthorized,
        },
        detail: {
            tags: ["Audience Groups"],
            summary: "List audience groups",
            description:
                "Retrieves a paginated list of audience groups with optional filtering",
        },
    },
);
