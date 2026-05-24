import { CreditErrors } from "@reloop/credits/error/credits.error-response";
import { db } from "@reloop/db/client";
import { creditLedger } from "@reloop/db/schema";
import { desc, eq } from "drizzle-orm";

export const listTransactionsController = async ({
	organizationId,
}: {
	organizationId: string;
}) => {
	try {
		return await db.query.creditLedger.findMany({
			where: eq(creditLedger.organizationId, organizationId),
			orderBy: [desc(creditLedger.createdAt)],
			limit: 50,
		});
	} catch (error) {
		throw CreditErrors.databaseError(
			error instanceof Error ? error.message : "Unknown database error",
		);
	}
};
