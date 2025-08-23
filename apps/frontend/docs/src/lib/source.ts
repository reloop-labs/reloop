import { docs } from "@dev/.source";
import { Icon } from "@reloop/ui/components/icon";
import { loader } from "fumadocs-core/source";
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
