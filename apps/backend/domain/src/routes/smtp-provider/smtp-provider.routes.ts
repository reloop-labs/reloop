import { Elysia } from "elysia";
import { createSmtpProviderRoute } from "./create-smtp-provider/create-smtp-provider.route";
import { deleteSmtpProviderRoute } from "./delete-smtp-provider/delete-smtp-provider.route";
import { listSmtpProvidersRoute } from "./list-smtp-providers/list-smtp-providers.route";
import { testSmtpProviderRoute } from "./test-smtp-provider/test-smtp-provider.route";
import { updateSmtpProviderRoute } from "./update-smtp-provider/update-smtp-provider.route";

export const smtpProviderRoutes = new Elysia({ name: "SmtpProviderRoutes" })
	.use(listSmtpProvidersRoute)
	.use(createSmtpProviderRoute)
	.use(testSmtpProviderRoute)
	.use(updateSmtpProviderRoute)
	.use(deleteSmtpProviderRoute);
