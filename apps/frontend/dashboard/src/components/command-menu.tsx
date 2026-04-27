"use client";

import { mainNavigation, userNavigation } from "@fe/dashboard/constants";
import { cn } from "@reloop/ui/cn";
import * as CommandMenu from "@reloop/ui/command";
import * as CompactButton from "@reloop/ui/compact-button";
import { Icon } from "@reloop/ui/icon";
import { KbdCommand } from "@reloop/ui/kbd-command";
import { KbdKey } from "@reloop/ui/kbd-key";
import { KbdKeyOutline } from "@reloop/ui/kbd-key-outline";
import * as LinkButton from "@reloop/ui/link-button";
import { ArrowDown, ArrowUp, CornerDownLeft, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import * as React from "react";
import { useHotkeys } from "react-hotkeys-hook";

export function CommandMenuGlobal() {
	const [open, setOpen] = React.useState(false);
	const router = useRouter();
	const { setTheme, resolvedTheme } = useTheme();

	// Toggle with CMD+K shortcut
	useHotkeys("mod+k", (e) => {
		e.preventDefault();
		setOpen((open) => !open);
	});

	const onThemeSelect = (themeValue: string) => {
		if (themeValue === "toggle") {
			setTheme(resolvedTheme === "light" ? "dark" : "light");
		} else {
			setTheme(themeValue);
		}
		setOpen(false);
	};

	const onSelect = (path: string) => {
		if (!path) return;
		router.push(path);
		setOpen(false);
	};

	// Quick theme toggle shortcut
	useHotkeys("mod+shift+l", (e) => {
		e.preventDefault();
		onThemeSelect("toggle");
	});

	const allNavigation = [...mainNavigation, ...userNavigation];

	const appearanceOptions = [
		{
			label: "Toggle theme",
			value: "toggle",
			icon: resolvedTheme === "dark" ? "sun" : "moon",
		},
		{ label: "Light theme", value: "light", icon: "sun" },
		{ label: "Dark theme", value: "dark", icon: "moon" },
		{ label: "System theme", value: "system", icon: "monitor" },
	];

	return (
		<CommandMenu.Dialog
			open={open}
			onOpenChange={setOpen}
			className="max-h-[450px]"
		>
			{/* Input wrapper */}
			<div className="group/cmd-input flex h-12 w-full items-center gap-2 bg-bg-white-0 px-5">
				<Search
					className={cn(
						"size-5 shrink-0 text-text-soft-400",
						"transition duration-200 ease-out",
						// focus within
						"group-focus-within/cmd-input:text-primary-base",
					)}
				/>
				<CommandMenu.Input placeholder="Search or jump to" />
				<span className="flex items-center gap-0.5">
					<KbdKeyOutline className="h-6 w-auto px-1.5 font-sans">
						<span className="text-xs">⌘</span>
					</KbdKeyOutline>
					<KbdKeyOutline className="h-6 w-auto px-1.5 font-sans">
						K
					</KbdKeyOutline>
				</span>
				<CompactButton.Root
					size="medium"
					variant="ghost"
					onClick={() => setOpen(false)}
				>
					<CompactButton.Icon as={X} />
				</CompactButton.Root>
			</div>

			{/* Groups */}
			<CommandMenu.List>
				<CommandMenu.Group heading="Pages">
					{allNavigation.map((item) => (
						<CommandMenu.Item
							key={item.path}
							onSelect={() => onSelect(item.path)}
						>
							<CommandMenu.ItemIcon as={Icon} name={item.iconName} />
							{item.label}
						</CommandMenu.Item>
					))}
				</CommandMenu.Group>

				<CommandMenu.Group heading="Appearance">
					{appearanceOptions.map((item) => (
						<CommandMenu.Item
							key={`${item.label} ${item.value}`}
							onSelect={() => onThemeSelect(item.value)}
						>
							<CommandMenu.ItemIcon as={Icon} name={item.icon} />
							<span className="flex-1">{item.label}</span>
							{item.value === "toggle" && (
								<span className="flex items-center gap-0.5">
									<KbdKeyOutline className="h-5 w-auto px-1 font-sans text-[10px]">
										<span className="text-[10px]">⌘⇧</span>
									</KbdKeyOutline>
									<KbdKeyOutline className="h-5 w-auto px-1 font-sans text-[10px]">
										L
									</KbdKeyOutline>
								</span>
							)}
						</CommandMenu.Item>
					))}
				</CommandMenu.Group>
			</CommandMenu.List>

			{/* Footer */}
			<CommandMenu.Footer className="border-stroke-soft-200 border-t">
				<div className="flex items-center gap-4">
					<div className="flex items-center gap-1.5">
						<CommandMenu.FooterKeyBox>
							<ArrowUp className="size-3" />
						</CommandMenu.FooterKeyBox>
						<CommandMenu.FooterKeyBox>
							<ArrowDown className="size-3" />
						</CommandMenu.FooterKeyBox>
						<span className="text-[11px] text-text-soft-400">Navigate</span>
					</div>
					<div className="flex items-center gap-1.5">
						<CommandMenu.FooterKeyBox>
							<CornerDownLeft className="size-3" />
						</CommandMenu.FooterKeyBox>
						<span className="text-[11px] text-text-soft-400">Select</span>
					</div>
				</div>

				<div className="text-[11px] text-text-soft-400">
					Need help?{" "}
					<LinkButton.Root
						size="small"
						variant="primary"
						className="font-medium text-[11px]"
						underline
					>
						Help Center
					</LinkButton.Root>
				</div>
			</CommandMenu.Footer>
		</CommandMenu.Dialog>
	);
}
