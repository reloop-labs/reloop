import { authMiddleware } from "@be/contacts/middleware/auth";
import { Elysia, t } from "elysia";
import { generatePreferenceTokenController } from "./generate-token.controllers";

import { rateLimitPlugin } from "@be/contacts/middleware/rate-limit";

export const generateTokenRoute = new Elysia()
	.use(authMiddleware)
	.use(rateLimitPlugin({ max: 30, windowSeconds: 60, namespace: "generate-pref-token" }))
	.get(
	"/generate",
	async ({ query, activeOrganizationId, logger }) => {
		return await generatePreferenceTokenController({
			organizationId: activeOrganizationId,
			contactId: query.contactId,
			email: query.email,
			logger,
		});
	},
	{
		auth: true,
		rateLimit: true,
		query: t.Object({
			contactId: t.Optional(t.String({ description: "Contact ID" })),
			email: t.Optional(t.String({ description: "Contact email" })),
		}),
		detail: {
			tags: ["Preferences"],
			summary: "Generate preference token",
			description:
				"Generate a signed preference management token for a contact. Embed the returned URL in email footers.",
		},
	},
);
