import { resolveTemplateThumbnail } from "@be/template/utils/template-thumbnail";

export async function getTemplateThumbnail(params: {
	templateId: string;
	organizationId: string;
}) {
	return resolveTemplateThumbnail(params);
}
