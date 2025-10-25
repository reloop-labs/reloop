import { authMiddleware } from "@reloop/audience/middleware/auth";
import { AudienceGroupModel } from "@reloop/audience/routes/audience-group/audience-group.model";
import { getAudienceGroupHandler } from "@reloop/audience/routes/audience-group/controllers/get-audience-group";
import { Elysia, status, t } from "elysia";

export const getAudienceGroupRoute = new Elysia().use(authMiddleware).get(
    "/audience-groups/:id",
    async ({ params, user }: { params: { id: string }; user: any }) => {
        if (!user.activeOrganizationId) {
            throw status(403, {
                message: "User is not a member of an organization",
            });
        }
        return await getAudienceGroupHandler(params.id, user.activeOrganizationId);
    },
    {
        auth: true,
        params: t.Object({
            id: t.String(),
        }),
        response: {
            200: AudienceGroupModel.audienceGroupResponse,
            404: AudienceGroupModel.audienceGroupNotFound,
            403: AudienceGroupModel.unauthorized,
        },
        detail: {
            tags: ["Audience Groups"],
            summary: "Get an audience group",
            description: "Retrieves a specific audience group by ID",
        },
    },
);
