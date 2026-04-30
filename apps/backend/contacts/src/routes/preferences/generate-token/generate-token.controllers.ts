import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import type { Logger } from "@reloop/logger";
import { and, eq, isNull } from "drizzle-orm";
import { status } from "elysia";
import { signToken } from "../token.utils";

const BASE_URL = process.env.BASE_URL || "https://local.reloop.sh";

export async function generatePreferenceTokenController({
  organizationId,
  contactId,
  email,
  logger,
}: {
  organizationId: string;
  contactId?: string;
  email?: string;
  logger: Logger;
}) {
  if (!contactId && !email) {
    throw status(400, { message: "Either 'contactId' or 'email' must be provided" });
  }

  logger.info({ contactId, email }, "Generating preference token");

  let contact: typeof schema.contact.$inferSelect | undefined;

  if (contactId) {
    contact = await db.query.contact.findFirst({
      where: and(
        eq(schema.contact.id, contactId),
        eq(schema.contact.organizationId, organizationId),
        isNull(schema.contact.deletedAt),
      ),
    });
  } else if (email) {
    contact = await db.query.contact.findFirst({
      where: and(
        eq(schema.contact.email, email.toLowerCase()),
        eq(schema.contact.organizationId, organizationId),
        isNull(schema.contact.deletedAt),
      ),
    });
  }

  if (!contact) {
    throw status(404, { message: "Contact not found" });
  }

  const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000;
  const token = await signToken({ contactId: contact.id, organizationId, expiresAt });
  const url = `${BASE_URL}/preferences/${token}`;

  logger.info({ contactId: contact.id }, "Preference token generated successfully");

  return {
    token,
    url,
    expiresAt: new Date(expiresAt).toISOString(),
    contactId: contact.id,
    email: contact.email,
  };
}
