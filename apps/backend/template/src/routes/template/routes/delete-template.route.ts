import { authMiddleware } from "@be/template/middleware/auth";
import { deleteTemplate } from "@be/template/routes/template/controllers";
import { t } from "elysia";
import { Elysia } from "elysia";

export const deleteTemplateRoute = new Elysia().use(authMiddleware).delete(
    "/:id",
    async ({ params, user }) => {
        const { activeOrganizationId: organizationId } = user;
        const { id } = params;

        const result = await deleteTemplate({
            id,
            organizationId,
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
            summary: "Delete template",
            description: "Soft deletes a template",
        },
    },
);
