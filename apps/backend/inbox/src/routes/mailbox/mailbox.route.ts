import { Elysia, t } from "elysia";
import {
	createMailboxController,
	getMailboxesController,
	deleteMailboxController,
} from "./mailbox.controllers";
import { evlog } from "evlog/elysia";

export const mailboxRoute = new Elysia({ prefix: "/v1/mailboxes" })
	.use(evlog())
	.get("/", async ({ headers }) => {
		// Mock auth for now, normally use auth middleware
		const orgId = headers["x-organization-id"] || "org_123";
		return getMailboxesController(orgId);
	})
	.post(
		"/",
		async ({ body, headers }) => {
			const orgId = headers["x-organization-id"] || "org_123";
			return createMailboxController({
				...body,
				organizationId: orgId,
			});
		},
		{
			body: t.Object({
				domainId: t.String(),
				email: t.String(),
				password: t.Optional(t.String()),
				quota: t.Optional(t.String()),
			}),
		}
	)
	.delete(
		"/:id",
		async ({ params: { id }, headers }) => {
			const orgId = headers["x-organization-id"] || "org_123";
			return deleteMailboxController(id, orgId);
		},
		{
			params: t.Object({
				id: t.String(),
			}),
		}
	);
