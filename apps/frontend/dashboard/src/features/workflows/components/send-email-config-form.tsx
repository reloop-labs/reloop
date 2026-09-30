"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
	createTemplate,
	type Template,
	useTemplateDetailQuery,
	useTemplatesQuery,
} from "#/features/templates/hooks/use-templates-query";
import { queryKeys } from "#/lib/query-keys";
import type { SendEmailNodeData } from "../workflow-types";

interface SendEmailConfigFormProps {
	value: SendEmailNodeData;
	onChange: (data: SendEmailNodeData) => void;
	/** Prefix for label/input ids so multiple nodes can share the canvas. */
	idPrefix?: string;
}

const templateThumbnailSrc = (template: Template): string => {
	const bust = template.updatedAt
		? `?t=${encodeURIComponent(template.updatedAt)}`
		: "";
	if (template.thumbnailUrl) return `${template.thumbnailUrl}${bust}`;
	return `/api/template/v1/${template.id}/thumbnail${bust}`;
};

const TemplateThumb = ({ template }: { template: Template }) => {
	const [failed, setFailed] = useState(false);
	return (
		<div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border border-stroke-soft-100 bg-bg-weak-50 dark:border-stroke-soft-100/40 dark:bg-black/30">
			{failed ? (
				<div className="flex h-full w-full items-center justify-center text-text-soft-400">
					<Icon name="image-upload" className="h-5 w-5" />
				</div>
			) : (
				<img
					src={templateThumbnailSrc(template)}
					alt={`Preview of ${template.name}`}
					className="h-full w-full object-cover object-top"
					loading="lazy"
					decoding="async"
					onError={() => setFailed(true)}
				/>
			)}
			{template.status === "draft" ? (
				<span className="absolute top-1.5 right-1.5 rounded-full bg-bg-white-0/90 px-1.5 py-0.5 font-medium text-[10px] text-text-sub-600 shadow-2xs backdrop-blur-xs dark:bg-black/80 dark:text-white/70">
					Draft
				</span>
			) : null}
		</div>
	);
};

const TemplatePicker = ({
	value,
	onChange,
}: {
	value: SendEmailNodeData;
	onChange: (data: SendEmailNodeData) => void;
}) => {
	const queryClient = useQueryClient();
	const router = useRouter();
	const [search, setSearch] = useState("");
	const [creating, setCreating] = useState(false);
	const templatesQuery = useTemplatesQuery();
	const templates = templatesQuery.data?.templates ?? [];

	const filtered = useMemo(() => {
		const q = search.toLowerCase().trim();
		if (!q) return templates;
		return templates.filter(
			(t) =>
				t.name.toLowerCase().includes(q) ||
				(t.subject?.toLowerCase().includes(q) ?? false),
		);
	}, [templates, search]);

	const selectTemplate = (template: Template) => {
		if (template.id === value.templateId) {
			onChange({ ...value, templateId: "" });
			return;
		}
		onChange({ ...value, templateId: template.id });
	};

	const handleCreateNew = async () => {
		if (creating) return;
		setCreating(true);
		try {
			const template = await createTemplate();
			await queryClient.invalidateQueries({
				queryKey: queryKeys.templates.all,
			});
			router.push(`/templates/${template.id}`);
		} catch {
			toast.error("Failed to create template");
			setCreating(false);
		}
	};

	return (
		<div className="space-y-2">
			<div className="relative">
				<Icon
					name="search"
					className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3 h-4 w-4 text-text-soft-400"
				/>
				<input
					type="text"
					placeholder="Search templates..."
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					onKeyDown={(e) => e.stopPropagation()}
					aria-label="Search templates"
					className="w-full rounded-xl border border-stroke-soft-100 bg-bg-white-0 py-2 pr-3 pl-9 text-sm text-text-strong-950 outline-none placeholder:text-text-soft-400 focus:border-blue-500"
				/>
			</div>
			{templatesQuery.isLoading ? (
				<p className="px-1 py-4 text-center text-text-sub-600 text-xs">
					Loading templates…
				</p>
			) : filtered.length === 0 && templates.length === 0 ? (
				<p className="px-1 py-4 text-center text-text-sub-600 text-xs">
					No templates yet. Create your first one below.
				</p>
			) : filtered.length === 0 ? (
				<p className="px-1 py-4 text-center text-text-sub-600 text-xs">
					No templates match “{search.trim()}”.
				</p>
			) : null}
			<div className="scrollbar-thin grid max-h-64 grid-cols-2 gap-2 overflow-y-auto overflow-x-hidden p-0.5">
				{filtered.map((template) => {
					const isSelected = value.templateId === template.id;
					return (
						<button
							key={template.id}
							type="button"
							onClick={() => selectTemplate(template)}
							aria-pressed={isSelected}
							title={template.name}
							className="group flex min-w-0 flex-col gap-1.5 rounded-xl p-1.5 text-left transition-colors hover:bg-bg-weak-50 dark:hover:bg-white/[0.06]"
						>
							<span
								className={cn(
									"relative block w-full overflow-hidden rounded-lg transition-all",
									isSelected &&
										"ring-2 ring-blue-500 ring-offset-1 ring-offset-bg-weak-50/50 dark:ring-offset-black/50",
								)}
							>
								<TemplateThumb template={template} />
								{isSelected ? (
									<span className="absolute top-1 left-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-white shadow-xs">
										<Icon name="check" className="h-3 w-3" />
									</span>
								) : null}
							</span>
							<span className="w-full truncate px-0.5 font-medium text-text-strong-950 text-xs">
								{template.name}
							</span>
						</button>
					);
				})}
				<button
					type="button"
					onClick={() => void handleCreateNew()}
					disabled={creating}
					className="group flex min-w-0 flex-col gap-1.5 rounded-xl p-1.5 text-left transition-colors hover:bg-bg-weak-50 disabled:cursor-wait disabled:opacity-60 dark:hover:bg-white/[0.06]"
				>
					<span className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-1 rounded-lg border border-stroke-soft-200 border-dashed text-text-sub-600 transition-colors group-hover:border-blue-500 group-hover:text-text-strong-950 dark:border-stroke-soft-100/60 dark:group-hover:border-blue-400 dark:group-hover:text-white">
						<Icon name="plus" className="h-5 w-5" />
						<span className="font-medium text-xs">
							{creating ? "Creating…" : "New template"}
						</span>
					</span>
					<span className="w-full truncate px-0.5 font-medium text-text-sub-600 text-xs transition-colors group-hover:text-text-strong-950 dark:group-hover:text-white">
						Create new
					</span>
				</button>
			</div>
		</div>
	);
};

type TemplateVersion = {
	id: string;
	version: number;
	subject?: string | null;
	fromEmail?: string | null;
	replyTo?: string | null;
	previewText?: string | null;
	content?: unknown;
	renderedHtml?: string | null;
	isMajor?: boolean;
};

const fetchVersions = async (
	templateId: string,
): Promise<TemplateVersion[]> => {
	const res = await fetch(`/api/template/v1/${templateId}/versions`, {
		credentials: "include",
	});
	if (!res.ok) throw new Error(`Failed to load versions (${res.status})`);
	return res.json() as Promise<TemplateVersion[]>;
};

const inputClassName =
	"w-full rounded-xl border border-stroke-soft-100 bg-bg-white-0 px-3 py-2 text-sm text-text-strong-950 outline-none placeholder:text-text-soft-400 focus:border-blue-500";

const SelectedTemplateView = ({
	templateId,
	templateName,
	onBack,
}: {
	templateId: string;
	templateName: string;
	onBack: () => void;
}) => {
	const queryClient = useQueryClient();
	const [tab, setTab] = useState<"preview" | "settings">("preview");
	const [publishing, setPublishing] = useState(false);
	const [savingSender, setSavingSender] = useState(false);
	const [fromDraft, setFromDraft] = useState<string | null>(null);
	const [replyDraft, setReplyDraft] = useState<string | null>(null);

	const detailQuery = useTemplateDetailQuery(templateId);
	const versionsQuery = useQuery({
		queryKey: [...queryKeys.templates.all, "versions", templateId],
		queryFn: () => fetchVersions(templateId),
	});
	const detail = detailQuery.data;
	const versions = useMemo(
		() => [...(versionsQuery.data ?? [])].sort((a, b) => b.version - a.version),
		[versionsQuery.data],
	);
	const latest = versions[0];
	const status = detail?.status ?? "draft";
	const isDraft = status !== "published";

	const resolvedFrom =
		fromDraft ?? latest?.fromEmail ?? detail?.fromEmail ?? "";
	const resolvedReply = replyDraft ?? latest?.replyTo ?? detail?.replyTo ?? "";
	const fromMissing = resolvedFrom.trim().length === 0;

	useEffect(() => {
		setFromDraft(null);
		setReplyDraft(null);
		setTab("preview");
	}, [templateId]);

	const invalidateTemplate = async () => {
		await queryClient.invalidateQueries({
			queryKey: queryKeys.templates.list(),
		});
		await queryClient.invalidateQueries({
			queryKey: queryKeys.templates.detail(templateId),
		});
		await queryClient.invalidateQueries({
			queryKey: [...queryKeys.templates.all, "versions", templateId],
		});
	};

	const saveSender = async () => {
		if (fromDraft === null && replyDraft === null) return;
		setSavingSender(true);
		try {
			const res = await fetch(`/api/template/v1/${templateId}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({
					fromEmail: fromDraft ?? resolvedFrom,
					replyTo: replyDraft ?? resolvedReply,
				}),
			});
			if (!res.ok) throw new Error(`Save failed (${res.status})`);
			setFromDraft(null);
			setReplyDraft(null);
			await invalidateTemplate();
		} catch {
			toast.error("Failed to save sender");
		} finally {
			setSavingSender(false);
		}
	};

	const handlePublish = async () => {
		if (publishing) return;
		const source = latest;
		if (!source) {
			toast.error("Nothing to publish yet — edit the template first");
			return;
		}
		setPublishing(true);
		try {
			const res = await fetch(`/api/template/v1/${templateId}/versions`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({
					content: source.content ?? [],
					renderedHtml: source.renderedHtml ?? undefined,
					subject:
						source.subject ?? detail?.subject ?? templateName ?? undefined,
					fromEmail: resolvedFrom || undefined,
					replyTo: resolvedReply || undefined,
					previewText: source.previewText ?? detail?.previewText ?? undefined,
					isMajor: true,
				}),
			});
			if (!res.ok) throw new Error(`Publish failed (${res.status})`);
			await invalidateTemplate();
			toast.success("Template published");
		} catch {
			toast.error("Failed to publish template");
		} finally {
			setPublishing(false);
		}
	};

	return (
		<div className="flex flex-col gap-2.5">
			<button
				type="button"
				onClick={onBack}
				className="inline-flex w-fit items-center gap-1 rounded-md px-1 py-0.5 font-medium text-text-sub-600 text-xs transition-colors hover:text-text-strong-950"
			>
				<Icon name="chevron-left" className="h-3.5 w-3.5" />
				<span className="max-w-[260px] truncate">{templateName}</span>
			</button>

			<div
				role="tablist"
				aria-label="Template view"
				className="grid grid-cols-2 gap-1 rounded-full bg-bg-weak-50 p-1"
			>
				{(["preview", "settings"] as const).map((t) => (
					<button
						key={t}
						type="button"
						role="tab"
						aria-selected={tab === t}
						onClick={() => setTab(t)}
						className={cn(
							"rounded-full py-1.5 font-medium text-sm capitalize transition-all",
							tab === t
								? "bg-bg-white-0 text-text-strong-950 shadow-sm"
								: "text-text-sub-600 hover:text-text-strong-950",
						)}
					>
						{t}
					</button>
				))}
			</div>

			{isDraft ? (
				<div className="flex items-center justify-between gap-2 rounded-xl bg-bg-weak-50 py-1.5 pr-1.5 pl-3">
					<p className="min-w-0 flex-1 truncate text-text-sub-600 text-xs">
						Draft template. Publish before use
					</p>
					<button
						type="button"
						onClick={() => void handlePublish()}
						disabled={publishing || detailQuery.isLoading}
						className="shrink-0 rounded-full bg-black px-4 py-1.5 font-medium text-sm text-white transition-opacity disabled:cursor-wait disabled:opacity-60 dark:bg-white dark:text-black"
					>
						{publishing ? "Publishing…" : "Publish"}
					</button>
				</div>
			) : null}

			{tab === "preview" ? (
				<div className="overflow-hidden rounded-xl border border-stroke-soft-100 bg-bg-white-0">
					{detailQuery.isLoading ? (
						<p className="px-3 py-8 text-center text-text-sub-600 text-xs">
							Loading preview…
						</p>
					) : (
						<img
							src={templateThumbnailSrc({
								id: templateId,
								updatedAt: detail?.updatedAt ?? "",
								thumbnailUrl: detail?.thumbnailUrl ?? null,
							} as Template)}
							alt={`Preview of ${templateName}`}
							className="max-h-72 w-full object-cover object-top"
							loading="lazy"
							decoding="async"
						/>
					)}
				</div>
			) : (
				<div className="flex flex-col gap-2 rounded-xl bg-bg-weak-50/60 p-3">
					<p className="font-medium text-sm text-text-strong-950">Sender</p>
					<input
						type="text"
						placeholder="Acme <acme@example.com>"
						value={resolvedFrom}
						onChange={(e) => setFromDraft(e.target.value)}
						onBlur={() => void saveSender()}
						onKeyDown={(e) => e.stopPropagation()}
						aria-label="Sender email"
						aria-invalid={fromMissing || undefined}
						disabled={savingSender}
						className={cn(
							inputClassName,
							fromMissing && "border-error-base",
							savingSender && "opacity-60",
						)}
					/>
					{fromMissing ? (
						<p className="px-1 text-error-base text-xs">From is required</p>
					) : null}
					<input
						type="text"
						placeholder="Reply to (optional)"
						value={resolvedReply}
						onChange={(e) => setReplyDraft(e.target.value)}
						onBlur={() => void saveSender()}
						onKeyDown={(e) => e.stopPropagation()}
						aria-label="Reply to email"
						disabled={savingSender}
						className={cn(inputClassName, savingSender && "opacity-60")}
					/>
				</div>
			)}
		</div>
	);
};

export const SendEmailConfigForm = ({
	value,
	onChange,
}: SendEmailConfigFormProps) => {
	const templatesQuery = useTemplatesQuery();
	const selectedName = useMemo(
		() =>
			templatesQuery.data?.templates.find((t) => t.id === value.templateId)
				?.name ?? "Template",
		[templatesQuery.data, value.templateId],
	);

	if (value.templateId) {
		return (
			<SelectedTemplateView
				templateId={value.templateId}
				templateName={selectedName}
				onBack={() => onChange({ ...value, templateId: "" })}
			/>
		);
	}
	return <TemplatePicker value={value} onChange={onChange} />;
};
