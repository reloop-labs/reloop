import { templateModel } from "@be/template/model/template.model";
import { TemplateError } from "@be/template/error/template.error";
import type { TemplateBlock } from "@reloop/db/schema";
import { logger } from "@reloop/logger";

export async function updateTemplate(params: {
    id: string;
    organizationId: string;
    name?: string;
    description?: string;
    subject?: string;
    content?: TemplateBlock[];
    variables?: string[];
    status?: "draft" | "published" | "archived";
}) {
    const { id, organizationId, ...updateData } = params;

    try {
        // Verify template exists and belongs to org
        const existing = await templateModel.findByIdAndOrg(id, organizationId);
        if (!existing) {
            throw TemplateError.notFound(id);
        }

        const result = await templateModel.update({
            id,
            ...updateData,
        });

        return result;
    } catch (error) {
        logger.error(
            {
                id,
                error: error instanceof Error ? error.message : String(error),
            },
            "Error updating template",
        );
        throw error;
    }
}
