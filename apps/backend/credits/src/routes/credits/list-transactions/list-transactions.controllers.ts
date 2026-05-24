import { db } from "@reloop/db/client";
import { creditLedger } from "@reloop/db/schema";
import { desc, eq } from "drizzle-orm";

export const listTransactionsController = async ({
	organizationId,
}: {
	organizationId: string;
}) => {
	return await db.query.creditLedger.findMany({
		where: eq(creditLedger.organizationId, organizationId),
		orderBy: [desc(creditLedger.createdAt)],
		limit: 50,
	});
};
