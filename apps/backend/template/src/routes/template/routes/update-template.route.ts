import { authMiddleware } from "@be/template/middleware/auth";
import { updateTemplate } from "@be/template/routes/template/controllers";
import { t } from "elysia";
import { Elysia } from "elysia";

export const updateTemplateRoute = new Elysia().use(authMiddleware).put(
    "/:id",
    async ({ params, body, user }) => {
        const { activeOrganizationId: organizationId } = user;
        const { id } = params;

        const result = await updateTemplate({
            id,
            organizationId,
            ...body,
        });

        return result;
    },
    {
        auth: true,
        params: t.Object({
            id: t.String(),
        }),
        body: t.Object({
            name: t.Optional(t.String({ minLength: 1, maxLength: 255 })),
            description: t.Optional(t.String()),
            subject: t.Optional(t.String({ maxLength: 500 })),
            content: t.Optional(t.Array(t.Any())),
            variables: t.Optional(t.Array(t.String())),
            status: t.Optional(t.Union([
                t.Literal("draft"),
                t.Literal("published"),
                t.Literal("archived"),
            ])),
        }),
        detail: {
            tags: ["Templates"],
            summary: "Update template",
            description: "Updates an existing template",
        },
    },
);
