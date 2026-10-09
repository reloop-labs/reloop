import { StartupApplicationModel } from "@reloop/admin/model/startup-application.model";
import { Elysia } from "elysia";
import { createStartupApplicationController } from "./startup-application.controllers";

/**
 * Public (no-auth) endpoint for the /startups marketing page.
 * Mounted directly on the admin service so visitors can apply
 * without signing up. Final path: POST /api/admin/startup-applications
 */
export const startupApplicationPublicRoute = new Elysia().post(
	"/startup-applications",
	async ({ body }) =>
		createStartupApplicationController({
			email: body.email,
			fullName: body.fullName,
			company: body.company,
			website: body.website,
			role: body.role,
			monthlyVolume: body.monthlyVolume,
			useCase: body.useCase,
		}),
	{
		body: StartupApplicationModel.createBody,
		response: {
			200: StartupApplicationModel.createResponse,
		},
		detail: {
			tags: ["Public"],
			summary: "Submit a startup program application (no auth)",
		},
	},
);
