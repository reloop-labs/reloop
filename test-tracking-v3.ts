import { desc, eq } from "drizzle-orm";
import { db } from "./packages/db/src/client";
import { emailEvent, emailLog } from "./packages/db/src/schema/email";

async function verifyTracking() {
  console.log("Checking latest email logs...");
  const latestLog = await db.query.emailLog.findFirst({
    orderBy: [desc(emailLog.createdAt)],
  });

  if (!latestLog) {
    console.log("No email logs found.");
    return;
  }

  const emailLogId = latestLog.id;
  console.log(`Verifying tracking for log ID: ${emailLogId}`);

  // TRACKING URLS point to MAIL service (port 8015)
  const openUrl = `http://localhost:8015/api/mail/v1/track/open/${emailLogId}`;
  const clickUrl = `http://localhost:8015/api/mail/v1/track/click/${emailLogId}?url=${encodeURIComponent("https://reloop.sh/welcome")}`;

  console.log(`Simulating open by hitting: ${openUrl}`);
  const openRes = await fetch(openUrl);
  console.log(`Open response status: ${openRes.status}`);

  console.log(`Simulating click by hitting: ${clickUrl}`);
  const clickRes = await fetch(clickUrl, { redirect: "manual" });
  console.log(`Click response status: ${clickRes.status}`);
  console.log(`Redirect Location: ${clickRes.headers.get("location")}`);

  console.log("Checking events in database...");
  const events = await db
    .select()
    .from(emailEvent)
    .where(eq(emailEvent.emailLogId, emailLogId));

  console.log("Events found:");
  for (const event of events) {
    console.log(
      `- Type: ${event.type}, CreatedAt: ${event.createdAt}, Metadata: ${event.metadata}`,
    );
  }

  if (events.length >= 2) {
    console.log("✅ Tracking successfully verified for migrated endpoints!");
  } else {
    console.log("❌ Tracking verification failed.");
    process.exit(1);
  }
}

verifyTracking().catch(console.error);
