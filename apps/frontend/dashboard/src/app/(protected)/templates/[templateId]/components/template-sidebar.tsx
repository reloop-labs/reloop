"use client";

import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { useRouter } from "next/navigation";
import { useEditorStore } from "../editor/use-editor-store";

export const TemplateSidebar = () => {
	const router = useRouter();
	const templateName = useEditorStore((s) => s.templateName);
	const setTemplateName = useEditorStore((s) => s.setTemplateName);
	const isDirty = useEditorStore((s) => s.isDirty);

	return (
		<div className="text-center">
			<p>dsfsjfsllkdj</p>
		</div>
	);
};
