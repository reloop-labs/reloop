import { Icon } from "@reloop/ui/icon";
import { loader } from "fumadocs-core/source";
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
});
