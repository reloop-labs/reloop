import { WEBHOOK_EVENTS } from "@reloop/webhook-events";

export async function seedWebhookEvents(_databaseUrl?: string) {
	console.log(
		"Webhook events are now hardcoded. Database seeding is no longer required.",
	);
	return {
		success: true,
		count: WEBHOOK_EVENTS.length,
	};
}

if (require.main === module) {
	seedWebhookEvents()
		.then(() => {
			console.log("Seed completed");
			process.exit(0);
		})
		.catch((error) => {
			console.error("Seed failed:", error);
			process.exit(1);
		});
}
