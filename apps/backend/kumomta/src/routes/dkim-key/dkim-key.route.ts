import { Elysia, t } from "elysia";
import { dkimKeyController } from "./dkim-key.controllers";

export const dkimKeyRoute = new Elysia().post(
	"/dkim-key",
	async ({ body, status }) => {
		const result = await dkimKeyController(body);
		if (result.error) {
			if (result.code === 401) return status(401, { message: result.error });
			if (result.code === 404) return status(404, { message: result.error });
			return status(500, { message: result.error });
		}
		return {
			selector: result.selector ?? "",
			privateKey: result.privateKey ?? "",
		};
	},
	{
		response: {
			200: t.Object({
				selector: t.String(),
				privateKey: t.String(),
			}),
			401: t.Object({ message: t.String() }),
			404: t.Object({ message: t.String() }),
			500: t.Object({ message: t.String() }),
		},
		body: t.Object({
			key: t.String(),
			domainName: t.String(),
		}),
		detail: {
			summary: "Get DKIM Key",
			description:
				"Internal endpoint for KumoMTA to fetch the DKIM private key and selector for a given domain, used to sign outgoing emails.",
		},
	},
);
