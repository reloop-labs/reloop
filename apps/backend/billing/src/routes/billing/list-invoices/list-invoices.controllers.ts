import { db } from "@reloop/db/client";
import { billingInvoice } from "@reloop/db/schema";
import { desc, eq } from "drizzle-orm";

export const listInvoicesController = async ({
	activeOrganizationId,
}: {
	activeOrganizationId: string;
}) => {
	return await db.query.billingInvoice.findMany({
		where: eq(billingInvoice.organizationId, activeOrganizationId),
		orderBy: [desc(billingInvoice.createdAt)],
	});
};
