import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import type { Logger } from "@reloop/logger";
import { and, eq, isNull } from "drizzle-orm";

export async function getExistingContact({
  email,
  organizationId,
  logger,
}: {
  email: string;
  organizationId: string;
  logger?: Logger;
}) {
  if (logger) {
    logger.info({ email, organizationId }, "Checking for existing contact");
  }

  const results = await db
    .select()
    .from(schema.contact)
    .where(
      and(
        eq(schema.contact.email, email),
        eq(schema.contact.organizationId, organizationId),
        isNull(schema.contact.deletedAt),
      ),
    )
    .limit(1);
  return results[0] || null;
}
