import { Icon } from "@reloop/ui/icon";
import { loader } from "fumadocs-core/source";
import { openapiPlugin } from "fumadocs-openapi/server";
import { createElement } from "react";
import { docs } from "../../.source/server";

export const source = loader({
	icon(icon) {
		if (!icon) return;
		if (icon) {
			return createElement(Icon, { name: icon });
		}
	},
	baseUrl: "/",
	source: docs.toFumadocsSource(),
	plugins: [openapiPlugin()]
});

