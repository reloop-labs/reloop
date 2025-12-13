import { authMiddleware } from "@be/template/middleware/auth";
import { duplicateTemplate } from "@be/template/routes/template/controllers";
import { t } from "elysia";
import { Elysia } from "elysia";

export const duplicateTemplateRoute = new Elysia().use(authMiddleware).post(
    "/:id/duplicate",
    async ({ params, user }) => {
        const { id: userId, activeOrganizationId: organizationId } = user;
        const { id } = params;

        const result = await duplicateTemplate({
            id,
            organizationId,
            userId,
        });

        return result;
    },
    {
        auth: true,
        params: t.Object({
            id: t.String(),
        }),
        detail: {
            tags: ["Templates"],
            summary: "Duplicate template",
            description: "Creates a copy of an existing template",
        },
    },
);
