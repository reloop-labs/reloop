"use client";

import { cn } from "@reloop/ui/cn";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useEditorStore } from "../editor/use-editor-store";

export const TemplateTitle = () => {
	const params = useParams();
	const templateId = params.templateId as string;
	const templateName = useEditorStore((s) => s.templateName);
	const setTemplateName = useEditorStore((s) => s.setTemplateName);

	const [localName, setLocalName] = useState(templateName);
	const [isUpdating, setIsUpdating] = useState(false);

	useEffect(() => {
		setLocalName(templateName);
	}, [templateName]);

	const handleUpdate = async () => {
		if (localName === templateName || !localName.trim()) {
			setLocalName(templateName);
			return;
		}

		setIsUpdating(true);
		try {
			const response = await fetch(`/api/template/v1/${templateId}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ name: localName }),
			});

			if (response.ok) {
				setTemplateName(localName);
			} else {
				console.error("Failed to update template name");
				setLocalName(templateName);
			}
		} catch (error) {
			console.error("Error updating template name:", error);
			setLocalName(templateName);
		} finally {
			setIsUpdating(false);
		}
	};

	return (
		<div className="flex h-14 items-center gap-2 px-6">
			<div className="relative flex flex-1 items-center">
				<input
					type="text"
					value={localName}
					onChange={(e) => setLocalName(e.target.value)}
					onBlur={handleUpdate}
					onKeyDown={(e) => {
						if (e.key === "Enter") {
							e.currentTarget.blur();
						}
					}}
					placeholder="Untitled Template"
					className={cn(
						"w-full bg-transparent font-medium text-sm text-text-strong-950 placeholder:text-text-soft-400",
						"outline-none transition-all duration-200",
						"-mx-2 rounded-md px-2 py-0.5",
						"hover:bg-neutral-alpha-10/50",
						"focus:bg-neutral-alpha-10 focus:ring-2 focus:ring-primary-base/10",
					)}
					disabled={isUpdating}
				/>
				{isUpdating && (
					<div className="absolute right-0 flex items-center">
						<div className="h-3 w-3 animate-spin rounded-full border-2 border-primary-base border-t-transparent" />
					</div>
				)}
			</div>
		</div>
	);
};
