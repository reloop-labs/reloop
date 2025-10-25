import { authMiddleware } from "@reloop/audience/middleware/auth";
import { AudienceGroupModel } from "@reloop/audience/routes/audience-group/audience-group.model";
import { deleteAudienceGroupHandler } from "@reloop/audience/routes/audience-group/controllers/delete-audience-group";
import type { User } from "@reloop/auth/server";
import { Elysia, status, t } from "elysia";

export const deleteAudienceGroupRoute = new Elysia().use(authMiddleware).delete(
    "/delete/:id",
    async ({ params, user }: { params: { id: string }; user: User }) => {
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
            404: AudienceGroupModel.audienceGroupNotFound,
            403: AudienceGroupModel.unauthorized,
        },
        detail: {
            tags: ["Audience Groups"],
            summary: "Delete an audience group",
            description: "Soft deletes an audience group and all its audiences",
        },
    },
);
