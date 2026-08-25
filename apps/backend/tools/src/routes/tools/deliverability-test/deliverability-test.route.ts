import { Elysia, t } from "elysia";
import {
	createDeliverabilityTestSession,
	getDeliverabilityTestSession,
	processInboundTesterEmail,
} from "./deliverability-test.controllers";

export const deliverabilityTestRoute = new Elysia()
	.post(
		"/deliverability-test",
		async ({ headers, server, request }) => {
			const forwardedFor = headers["x-forwarded-for"];
			const realIp = headers["x-real-ip"];
			let clientIp = "127.0.0.1";
			if (typeof forwardedFor === "string") {
				const parts = forwardedFor.split(",");
				if (parts[0]) clientIp = parts[0].trim();
			} else if (typeof realIp === "string") {
				clientIp = realIp;
			} else if (server?.requestIP(request)?.address) {
				clientIp = server.requestIP(request)!.address;
			}

			return await createDeliverabilityTestSession(clientIp);
		},
		{
			detail: {
				summary: "Create Deliverability Test Address",
				description:
					"Generates a unique ephemeral email address (e.g. test-a1b2c3@mailtest.reloop.sh) to send a test email from your mail server or ESP.",
				tags: ["Tools", "Deliverability"],
			},
			response: {
				200: t.Object({
					token: t.String(),
					address: t.String(),
					expiresAt: t.String(),
					pollUrl: t.String(),
				}),
				429: t.Object({
					message: t.String(),
					why: t.String(),
					fix: t.String(),
				}),
			},
		},
	)
	.get(
		"/deliverability-test/:token",
		async ({ params: { token } }) => {
			return await getDeliverabilityTestSession(token);
		},
		{
			params: t.Object({
				token: t.String({
					description:
						"The unique session token returned when the test address was created.",
				}),
			}),
			detail: {
				summary: "Get Deliverability Test Report",
				description:
					"Poll for test results. Returns 'pending' while waiting for the email to arrive, or 'received' with the complete 0–10 score and diagnostic breakdown once ingested.",
				tags: ["Tools", "Deliverability"],
			},
		},
	)
	.post(
		"/deliverability-test/inject",
		async ({ body }) => {
			const { rawMime } = body;
			return await processInboundTesterEmail(rawMime);
		},
		{
			body: t.Object({
				rawMime: t.String({
					description: "Raw RFC 822 MIME message string to analyze directly.",
				}),
			}),
			detail: {
				summary: "Direct Ingest / Test MIME Injection",
				description:
					"Directly inject raw MIME for testing the deliverability diagnostic engine.",
				tags: ["Tools", "Deliverability"],
			},
		},
	);
