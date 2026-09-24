import { db } from "../packages/db/src/client.js";
import { emailLog, emailEvent } from "../packages/db/src/schema/email.js";
import { emailSend } from "../packages/db/src/schema/billing.js";
import { eq, inArray } from "drizzle-orm";

// 16 primary demo emails in desired display order (newest to oldest)
const primaryEmails = [
	{ id: "eml_f7y5zc4bgxxvmn1jiw4oyx4k", offsetMinutes: 4 }, // 4 min ago (Linear)
	{ id: "eml_vr4tpw1y1wjgf5c9207jvedg", offsetMinutes: 19 }, // 19 min ago (Vercel)
	{ id: "eml_cpazbea5i1992eo2wbmiwbmh", offsetMinutes: 42 }, // 42 min ago (OpenAI)
	{ id: "eml_ghzgl0aaiei97ewut91gnusx", offsetMinutes: 75 }, // 1 hour ago (Figma)
	{ id: "eml_p43pqqdrxwo7bu02rffyh5jv", offsetMinutes: 140 }, // 2 hours ago (Supabase)
	{ id: "eml_izpqb782mdchtrfs7tx06te3", offsetMinutes: 260 }, // 4 hours ago (Shopify)
	{ id: "eml_ww0arybhme6t52pxv6met5ar", offsetMinutes: 410 }, // 6 hours ago (GitHub)
	{ id: "eml_yun1sdjheaj9nf1umbilfyqy", offsetMinutes: 580 }, // 9 hours ago (Tailscale)
	{ id: "eml_woktueofr7x4pp4ziir565y0", offsetMinutes: 840 }, // 14 hours ago (PostHog)
	{ id: "eml_u4bqp5rkswixklju6htxe1c3", offsetMinutes: 1260 }, // 21 hours ago (Slack)
	{ id: "eml_y14iiwt82av5ufbxofvgm7uf", offsetMinutes: 1800 }, // 1 day ago (Datadog)
	{ id: "eml_ng1s13ohf7avdosznhm2ga96", offsetMinutes: 2900 }, // 2 days ago (Raycast)
	{ id: "eml_mp1jpk42in27czwg27ucdfjs", offsetMinutes: 4400 }, // 3 days ago (Cloudflare)
	{ id: "eml_ci0smtvh0s1segsoha0y1w5p", offsetMinutes: 6100 }, // 4 days ago (Airbnb)
	{ id: "eml_psnw01th25yfcbmha1jll8y0", offsetMinutes: 7800 }, // 5 days ago (Uber)
	{ id: "eml_v0mjiy0iitfdxos2ildq9cj3", offsetMinutes: 10100 }, // 7 days ago (Notion)
];

// Duplicate / intermediate test IDs from earlier run to remove so table is pristine
const duplicateTestIds = [
	"eml_nnun90fxak3qxatvxtb4b78f",
	"eml_xgz38hzzbkt69p6qawx6xx4m",
	"eml_w6boh6gi4h9y7b4vwefwooul",
	"eml_ydnramy4cjkehoesantm6bma",
	"eml_dq724c0feyybji7rivjndat3",
	"eml_d39a1hjb6ub0kvaaomsmuqfl",
	"eml_cfyy4r5irai6vkyp89ryz1sl",
	"eml_mhz14h2fdgw0d2d5f81sjo1t",
	"eml_yc5jv7a30xj2shlbyv6u1q6o",
	"eml_mkaf9ksc0qgsrcmn4a6onki8",
	"eml_fj36s7ignx8zlys94ophzh78",
	"eml_l3qmaea8bguv53dlwqaw47vv",
	"eml_to4p6zwb2ajft5y59ng6q2z0",
];

async function main() {
	const now = Date.now();
	console.log("🕒 Staggering email dates relative to current time...");

	// 1. Remove earlier test duplicates
	if (duplicateTestIds.length > 0) {
		console.log(`🧹 Cleaning up ${duplicateTestIds.length} duplicate test emails...`);
		await db.delete(emailSend).where(inArray(emailSend.emailLogId, duplicateTestIds));
		await db.delete(emailEvent).where(inArray(emailEvent.emailLogId, duplicateTestIds));
		await db.delete(emailLog).where(inArray(emailLog.id, duplicateTestIds));
	}

	// 2. Update timestamps for each primary demo email
	for (const item of primaryEmails) {
		const targetTime = new Date(now - item.offsetMinutes * 60 * 1000);
		const sentTime = new Date(targetTime.getTime() + 150);
		const deliveredTime = new Date(targetTime.getTime() + 450);

		await db
			.update(emailLog)
			.set({
				createdAt: targetTime,
				sentAt: sentTime,
				deliveredAt: deliveredTime,
				updatedAt: deliveredTime,
			})
			.where(eq(emailLog.id, item.id));

		await db
			.update(emailEvent)
			.set({
				createdAt: deliveredTime,
			})
			.where(eq(emailEvent.emailLogId, item.id));

		await db
			.update(emailSend)
			.set({
				createdAt: targetTime,
				sentAt: sentTime,
			})
			.where(eq(emailSend.emailLogId, item.id));

		const display =
			item.offsetMinutes < 60
				? `${item.offsetMinutes}m ago`
				: item.offsetMinutes < 1440
					? `${(item.offsetMinutes / 60).toFixed(1)}h ago`
					: `${(item.offsetMinutes / 1440).toFixed(1)}d ago`;

		console.log(`  Updated ${item.id} -> ${display} (${targetTime.toISOString()})`);
	}

	console.log("\n🎉 Successfully staggered all email dates!");
}

main().catch(console.error);
