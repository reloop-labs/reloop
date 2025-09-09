import { Icon } from "@reloop/ui/icon";
import { loader } from "fumadocs-core/source";
import { attachFile, createOpenAPI } from "fumadocs-openapi/server";
import { createElement } from "react";
import { docs } from "../../.source";

export const source = loader({
	icon(icon) {
		if (!icon) return;
		if (icon) {
			return createElement(Icon, { name: icon });
		}
	},
	baseUrl: "/",
	source: docs.toFumadocsSource(),
	pageTree: {
		attachFile: attachFile as (node: any, file?: any) => any,
	},
});

// Create openapi instance without configuration for now
export const openapi = createOpenAPI();
