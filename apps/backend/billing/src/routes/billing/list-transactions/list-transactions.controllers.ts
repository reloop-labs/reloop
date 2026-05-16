import { db } from "@reloop/db/client";
import { creditLedger } from "@reloop/db/schema";
import { desc, eq } from "drizzle-orm";

export const listTransactionsController = async ({ activeOrganizationId }: { activeOrganizationId: string }) => {
	return await db.query.creditLedger.findMany({
		where: eq(creditLedger.organizationId, activeOrganizationId),
		orderBy: [desc(creditLedger.createdAt)],
		limit: 50,
	});
};
