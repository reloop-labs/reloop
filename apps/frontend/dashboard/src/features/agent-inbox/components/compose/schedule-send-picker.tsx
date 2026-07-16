import { cn } from "@reloop/ui/cn";
import { Clock, X } from "lucide-react";
import { useMemo, useState } from "react";

export const ScheduleSendPicker = ({
	value,
	onChange,
	disabled,
}: {
	value?: string;
	onChange: (iso?: string) => void;
	disabled?: boolean;
}) => {
	const [open, setOpen] = useState(false);
	const initial = useMemo(() => {
		if (!value) return { date: "", time: "" };
		const d = new Date(value);
		if (Number.isNaN(d.getTime())) return { date: "", time: "" };
		return {
			date: d.toISOString().slice(0, 10),
			time: d.toTimeString().slice(0, 5),
		};
	}, [value]);
	const [date, setDate] = useState(initial.date);
	const [time, setTime] = useState(initial.time);

	const apply = () => {
		if (!date || !time) return;
		const iso = new Date(`${date}T${time}:00`).toISOString();
		if (new Date(iso).getTime() <= Date.now()) return;
		onChange(iso);
		setOpen(false);
	};

	const clear = () => {
		onChange(undefined);
		setDate("");
		setTime("");
		setOpen(false);
	};

	return (
		<div className="relative">
			<button
				type="button"
				disabled={disabled}
				onClick={() => setOpen((v) => !v)}
				className={cn(
					"inline-flex h-8 items-center gap-1 rounded-md border border-[#E7E7E7] bg-transparent px-2 text-mail-foreground text-sm transition-colors hover:bg-gray-50 disabled:opacity-40 dark:border-[#2B2B2B] dark:hover:bg-[var(--inbox-control-hover)]",
					value && "border-zero-blue/40 bg-zero-blue/5",
				)}
				title={
					value
						? `Scheduled: ${new Date(value).toLocaleString()}`
						: "Send later"
				}
			>
				<Clock className="h-3.5 w-3.5 text-[#9A9A9A]" />
				{value ? (
					<span className="hidden text-xs sm:inline">
						{new Date(value).toLocaleString(undefined, {
							month: "short",
							day: "numeric",
							hour: "numeric",
							minute: "2-digit",
						})}
					</span>
				) : null}
			</button>

			{open && (
				<div className="absolute bottom-full left-0 z-50 mb-2 w-[260px] rounded-lg border border-mail-border bg-panel-light p-3 shadow-lg dark:bg-panel-dark">
					<p className="mb-2 font-medium text-mail-foreground text-xs">
						Schedule send
					</p>
					<div className="flex flex-col gap-2">
						<input
							type="date"
							value={date}
							min={new Date().toISOString().slice(0, 10)}
							onChange={(e) => setDate(e.target.value)}
							className="rounded-md border border-mail-border bg-transparent px-2 py-1.5 text-sm outline-none"
						/>
						<input
							type="time"
							value={time}
							onChange={(e) => setTime(e.target.value)}
							className="rounded-md border border-mail-border bg-transparent px-2 py-1.5 text-sm outline-none"
						/>
						<div className="flex items-center justify-between gap-2 pt-1">
							{value ? (
								<button
									type="button"
									onClick={clear}
									className="inline-flex items-center gap-1 text-mail-muted text-xs hover:text-mail-foreground"
								>
									<X className="h-3 w-3" />
									Cancel
								</button>
							) : (
								<span />
							)}
							<button
								type="button"
								onClick={apply}
								disabled={!date || !time}
								className="rounded-md bg-black px-2.5 py-1 text-white text-xs disabled:opacity-40 dark:bg-white dark:text-black"
							>
								Set
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};
