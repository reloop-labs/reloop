import { docs } from "@reloop/fe-docs/.source";
import { Icon } from "@reloop/ui/icon";
import { loader } from "fumadocs-core/source";
import { createOpenAPI } from "fumadocs-openapi/server";
import { createElement } from "react";

export const source = loader({
	icon(icon) {
		if (!icon) return;
		if (icon) {
			return createElement(Icon, { name: icon });
		}
	},
	baseUrl: "/",
	source: docs.toFumadocsSource(),
});

// Create openapi instance without configuration for now
export const openapi = createOpenAPI();
