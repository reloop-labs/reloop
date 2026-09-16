import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "../../src/lib/auth";

const BASE = "http://localhost/api/auth/v1";
const OTP = process.env.DEFAULT_OTP as string;
const OWNER = "owner@probe.test";

function handle(path: string, body: unknown, cookie?: string) {
	return auth.handler(
		new Request(`${BASE}${path}`, {
			method: "POST",
			headers: {
				"content-type": "application/json",
				origin: "http://localhost",
				...(cookie ? { cookie } : {}),
			},
			body: JSON.stringify(body),
		}),
	);
}

async function signUpPassword(email: string): Promise<number> {
	const res = await handle("/sign-up/email", {
		email,
		password: "password12345",
		name: "Probe User",
	});
	return res.status;
}

async function signInOtp(email: string): Promise<number> {
	await handle("/email-otp/send-verification-otp", { email, type: "sign-in" });
	const res = await handle("/sign-in/email-otp", { email, otp: OTP });
	return res.status;
}

async function cookieFor(email: string): Promise<string> {
	await handle("/email-otp/send-verification-otp", { email, type: "sign-in" });
	const res = await handle("/sign-in/email-otp", { email, otp: OTP });
	return res.headers
		.getSetCookie()
		.map((c) => c.split(";")[0])
		.join("; ");
}

async function ownerRow() {
	const [owner] = await db
		.select()
		.from(schema.user)
		.where(eq(schema.user.email, OWNER));
	if (!owner) throw new Error(`probe owner ${OWNER} was not seeded`);
	return owner;
}

async function invite(email: string, expiresAt: Date): Promise<void> {
	const owner = await ownerRow();
	await db.insert(schema.invitation).values({
		id: `inv_${crypto.randomUUID()}`,
		email,
		role: "member",
		status: "pending",
		expiresAt,
		organizationId: "org_probe",
		inviterId: owner.id,
	});
}

const results: Record<string, number> = {};

if (process.env.PROBE_MODE === "seed") {
	results.ownerSignUp = await signUpPassword(OWNER);
	results.memberSignUp = await signInOtp("member@probe.test");

	const owner = await ownerRow();
	await db.insert(schema.organization).values({
		id: "org_probe",
		name: "Probe Org",
		slug: `probe-${Date.now()}`,
		createdAt: new Date(),
	});
	await db.insert(schema.member).values({
		id: `mem_${crypto.randomUUID()}`,
		organizationId: "org_probe",
		userId: owner.id,
		role: "owner",
		createdAt: new Date(),
	});
} else {
	results.strangerPassword = await signUpPassword(
		`stranger-${crypto.randomUUID()}@probe.test`,
	);
	results.strangerOtp = await signInOtp(
		`stranger-${crypto.randomUUID()}@probe.test`,
	);
	results.existingUserSignIn = await signInOtp("member@probe.test");

	const pending = `pending-${crypto.randomUUID()}@probe.test`;
	await invite(pending, new Date(Date.now() + 3_600_000));
	results.pendingInvite = await signInOtp(pending);

	const expired = `expired-${crypto.randomUUID()}@probe.test`;
	await invite(expired, new Date(Date.now() - 3_600_000));
	results.expiredInvite = await signInOtp(expired);

	// Use a member who does not already own an org. The owner of org_probe
	// is on Free, so the one-free-org quota would 403 a second create and
	// this check would no longer isolate DISABLE_ORG_CREATION.
	const cookie = await cookieFor("member@probe.test");
	const org = await handle(
		"/organization/create",
		{ name: "Second Org", slug: `second-${crypto.randomUUID()}` },
		cookie,
	);
	results.organizationCreate = org.status;
}

console.log(JSON.stringify(results));
process.exit(0);
