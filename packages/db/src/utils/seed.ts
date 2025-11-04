import { createDb } from "../client";
import { webhookEvent } from "../schema/webhook";

interface WebhookEventSeed {
	name: string;
	category: string;
	description: string;
	isActive: boolean;
}

const webhookEvents: WebhookEventSeed[] = [
	{
		name: "domain.create",
		category: "domain",
		description: "Triggered when a new domain is created",
		isActive: true,
	},
	{
		name: "domain.update",
		category: "domain",
		description: "Triggered when a domain is updated",
		isActive: true,
	},
	{
		name: "domain.delete",
		category: "domain",
		description: "Triggered when a domain is deleted",
		isActive: true,
	},
	{
		name: "audience.create",
		category: "audience",
		description: "Triggered when a new audience is created",
		isActive: true,
	},
	{
		name: "audience.update",
		category: "audience",
		description: "Triggered when an audience is updated",
		isActive: true,
	},
	{
		name: "audience.delete",
		category: "audience",
		description: "Triggered when an audience is deleted",
		isActive: true,
	},
	{
		name: "email.sent",
		category: "email",
		description: "Triggered when an email is successfully sent",
		isActive: true,
	},
	{
		name: "email.opened",
		category: "email",
		description: "Triggered when an email is opened by the recipient",
		isActive: true,
	},
	{
		name: "email.clicked",
		category: "email",
		description: "Triggered when a link in an email is clicked",
		isActive: true,
	},
	{
		name: "email.failed",
		category: "email",
		description: "Triggered when an email fails to send",
		isActive: true,
	},
	{
		name: "email.bounced",
		category: "email",
		description: "Triggered when an email bounces",
		isActive: true,
	},
];

export async function seedWebhookEvents(databaseUrl?: string) {
	console.log("🌱 Seeding webhook events...");

	// Validate database URL
	const pgUrl = databaseUrl || process.env.PG_URL;
	if (!pgUrl) {
		throw new Error(
			"Database URL is required. Set PG_URL environment variable or pass it as an argument.",
		);
	}

	const db = createDb({ databaseUrl: pgUrl });

	try {
		for (const event of webhookEvents) {
			await db
				.insert(webhookEvent)
				.values(event)
				.onConflictDoUpdate({
					target: webhookEvent.name,
					set: {
						category: event.category,
						description: event.description,
						isActive: event.isActive,
						updatedAt: new Date(),
					},
				});

			console.log(`✅ Upserted webhook event: ${event.name}`);
		}

		console.log("✨ Webhook events seeded successfully!");
		return { success: true, count: webhookEvents.length };
	} catch (error) {
		console.error("❌ Error seeding webhook events:", error);
		throw error;
	}
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
