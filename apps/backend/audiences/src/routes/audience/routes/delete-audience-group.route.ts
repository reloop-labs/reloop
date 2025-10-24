import { authMiddleware } from "@reloop/audience/middleware/auth";
import { AudienceModel } from "@reloop/audience/routes/audience/audience.model";
import { deleteAudienceGroupHandler } from "@reloop/audience/routes/audience/controllers/delete-audience-group";
import { Elysia, status, t } from "elysia";

export const deleteAudienceGroupRoute = new Elysia().use(authMiddleware).delete(
    "/audience-groups/:id",
    async ({ params, user }: { params: { id: string }; user: any }) => {
        if (!user.activeOrganizationId) {
            throw status(403, {
                message: "User is not a member of an organization",
            });
        }
        return await deleteAudienceGroupHandler(
            params.id,
            user.activeOrganizationId,
        );
    },
    {
        auth: true,
        params: t.Object({
            id: t.String(),
        }),
        response: {
            200: t.Object({
                message: t.String(),
            }),
            404: AudienceModel.audienceGroupNotFound,
            403: AudienceModel.unauthorized,
        },
        detail: {
            tags: ["Audience Groups"],
            summary: "Delete an audience group",
            description: "Soft deletes an audience group and all its audiences",
        },
    },
);
