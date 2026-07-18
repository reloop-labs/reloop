import * as Popover from "@reloop/ui/popover";
import { FileText, Search } from "lucide-react";
import { LoadingDot } from "../shared/loading-dot";
import { useCallback, useEffect, useMemo, useState } from "react";

type TemplateListItem = {
	id: string;
	name: string;
	subject: string | null;
	status: string;
};

export type AppliedTemplate = {
	id: string;
	name: string;
	subject: string;
	html: string;
};

export const TemplateButton = ({
	onApply,
	disabled,
}: {
	onApply: (tpl: AppliedTemplate) => void;
	disabled?: boolean;
}) => {
	const [open, setOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const [applying, setApplying] = useState<string | null>(null);
	const [q, setQ] = useState("");
	const [templates, setTemplates] = useState<TemplateListItem[]>([]);

	const load = useCallback(async () => {
		setLoading(true);
		try {
			const res = await fetch("/api/template/v1/list?limit=50");
			if (!res.ok) throw new Error("Failed to load templates");
			const data = (await res.json()) as {
				templates?: TemplateListItem[];
			};
			setTemplates(data.templates ?? []);
		} catch {
			setTemplates([]);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		if (open) void load();
	}, [open, load]);

	const filtered = useMemo(() => {
		const query = q.trim().toLowerCase();
		if (!query) return templates;
		return templates.filter(
			(t) =>
				t.name.toLowerCase().includes(query) ||
				(t.subject?.toLowerCase().includes(query) ?? false),
		);
	}, [templates, q]);

	const apply = async (id: string) => {
		setApplying(id);
		try {
			const res = await fetch(`/api/template/v1/${id}/versions`);
			if (!res.ok) throw new Error("Failed to load template");
			const data = (await res.json()) as {
				versions?: Array<{
					subject?: string | null;
					renderedHtml?: string | null;
					isMajor?: boolean;
				}>;
			};
			const versions = data.versions ?? [];
			const published =
				versions.find((v) => v.isMajor && v.renderedHtml) ?? versions[0];
			const tpl = templates.find((t) => t.id === id);
			if (!published?.renderedHtml || !tpl) return;
			onApply({
				id,
				name: tpl.name,
				subject: published.subject || tpl.subject || "",
				html: published.renderedHtml,
			});
			setOpen(false);
		} finally {
			setApplying(null);
		}
	};

	return (
		<Popover.Root open={open} onOpenChange={setOpen}>
			<Popover.Trigger asChild>
				<button
					type="button"
					disabled={disabled}
					className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-mail-border/50 bg-transparent px-2.5 font-medium text-[12px] text-mail-muted hover:bg-[var(--inbox-hover)] hover:text-mail-foreground disabled:opacity-40"
				>
					<FileText className="h-3.5 w-3.5" />
					Templates
				</button>
			</Popover.Trigger>
			<Popover.Content
				align="start"
				sideOffset={6}
				showArrow={false}
				className="z-[100] w-[300px] rounded-lg border border-[#E7E7E7] bg-white p-0 shadow-lg dark:border-[#2B2B2B] dark:bg-[#202020]"
			>
				<div className="flex items-center gap-2 border-[#E7E7E7] border-b px-3 py-2 dark:border-[#2B2B2B]">
					<Search className="h-3.5 w-3.5 text-mail-muted" />
					<input
						value={q}
						onChange={(e) => setQ(e.target.value)}
						placeholder="Search templates..."
						className="w-full bg-transparent text-sm outline-none"
					/>
				</div>
				<div className="max-h-[240px] overflow-y-auto p-1">
					{loading ? (
						<div className="flex items-center justify-center py-6 text-mail-muted">
							<LoadingDot label="Loading templates" style={{ fontSize: 14 }} />
						</div>
					) : filtered.length === 0 ? (
						<p className="px-3 py-6 text-center text-mail-muted text-xs">
							No templates found
						</p>
					) : (
						filtered.map((t) => (
							<button
								key={t.id}
								type="button"
								onClick={() => void apply(t.id)}
								disabled={!!applying}
								className="flex w-full items-start gap-2 rounded-md px-2 py-2 text-left hover:bg-black/5 dark:hover:bg-white/10"
							>
								{applying === t.id ? (
									<span className="mt-0.5 text-mail-muted">
										<LoadingDot
											label="Applying template"
											style={{ fontSize: 12 }}
										/>
									</span>
								) : (
									<FileText className="mt-0.5 h-3.5 w-3.5 text-mail-muted" />
								)}
								<div className="min-w-0 flex-1">
									<p className="truncate font-medium text-sm">{t.name}</p>
									{t.subject && (
										<p className="truncate text-mail-muted text-xs">
											{t.subject}
										</p>
									)}
								</div>
							</button>
						))
					)}
				</div>
			</Popover.Content>
		</Popover.Root>
	);
};
