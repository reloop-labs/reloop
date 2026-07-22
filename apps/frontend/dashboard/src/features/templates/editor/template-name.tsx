import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useDebounceCallback } from "usehooks-ts";
import { useSWR } from "#/features/templates/editor/lib/use-swr-compat";
import { useTemplateId } from "#/features/templates/editor/lib/use-template-id";

const fetcher = (url: string) =>
	fetch(url, { credentials: "include" }).then((res) => res.json());

export const TemplateName = () => {
	const templateId = useTemplateId();

	const { data, mutate, isLoading } = useSWR(
		templateId ? `/api/template/v1/${templateId}` : null,
		fetcher,
	);
	const [name, setName] = useState("");
	const isInitialLoad = useRef(true);

	useEffect(() => {
		if (data?.name && isInitialLoad.current) {
			setName(data.name);
			isInitialLoad.current = false;
		}
	}, [data?.name]);

	const debouncedUpdate = useDebounceCallback(async (newName: string) => {
		if (!templateId || !newName) return;
		try {
			const response = await fetch(`/api/template/v1/${templateId}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name: newName }),
				credentials: "include",
			});
			if (response.ok) {
				mutate({ ...data, name: newName }, false);
			}
		} catch (error) {
			console.error("Failed to update template name:", error);
		}
	}, 1000);

	const inputRef = useRef<HTMLInputElement>(null);
	const measureRef = useRef<HTMLSpanElement>(null);

	// biome-ignore lint/correctness/useExhaustiveDependencies: name changes DOM width, which we need to measure
	useEffect(() => {
		if (measureRef.current && inputRef.current) {
			// Add a small buffer to prevent jitter
			const width = measureRef.current.offsetWidth;
			inputRef.current.style.width = `${width}px`;
		}
	}, [name]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newName = e.target.value;
		setName(newName);
		debouncedUpdate(newName);
	};

	if (isLoading && !name) {
		return (
			<div className="h-7 w-48 animate-pulse rounded-md bg-bg-weak-50 dark:bg-white/5" />
		);
	}

	return (
		<div className="flex items-center">
			<div className="flex items-center gap-1.5">
				<Icon name="layout" className="size-4 text-text-sub-600" />
				<Link
					to="/templates"
					className="font-medium text-sm hover:text-text-strong-950"
				>
					Templates
				</Link>
			</div>

			<span className="ml-2.5 text-text-disabled-300 text-xs">/</span>

			<div className="group ml-1 flex items-center">
				<span
					ref={measureRef}
					className="invisible absolute whitespace-pre px-2 py-1 font-bold text-sm"
					aria-hidden="true"
				>
					{name || "Template name"}
				</span>
				<input
					ref={inputRef}
					value={name}
					onChange={handleChange}
					placeholder="Template name"
					className="rounded-md bg-transparent px-2 py-1 font-bold text-sm text-text-strong-950 outline-none transition-colors placeholder:text-text-soft-400 hover:bg-bg-weak-50 focus:ring-0 dark:text-white dark:hover:bg-white/5"
				/>
				{data?.status && (
					<span
						className={cn(
							"ml-2 shrink-0 select-none rounded-md border px-1.5 py-0.5 font-semibold text-[10px] capitalize",
							data.status === "published" &&
								"border-success-base/20 bg-success-base/5 text-success-base",
							data.status === "draft" &&
								"border-amber-600/20 bg-amber-600/5 text-amber-600 dark:text-amber-500",
							data.status === "archived" &&
								"border-text-sub-600/20 bg-text-sub-600/5 text-text-sub-600",
						)}
					>
						{data.status}
					</span>
				)}
			</div>
		</div>
	);
};
