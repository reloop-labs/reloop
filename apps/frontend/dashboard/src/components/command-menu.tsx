"use client";

import { mainNavigation, userNavigation } from "@fe/dashboard/constants";
import { cn } from "@reloop/ui/cn";
import * as CommandMenu from "@reloop/ui/command";
import * as CompactButton from "@reloop/ui/compact-button";
import { Icon } from "@reloop/ui/icon";
import * as Kbd from "@reloop/ui/kbd";
import * as LinkButton from "@reloop/ui/link-button";
import { ArrowDown, ArrowUp, CornerDownLeft, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import * as React from "react";

export function CommandMenuGlobal() {
	const [open, setOpen] = React.useState(false);
	const router = useRouter();
	const { setTheme } = useTheme();

	// Toggle with CMD+K shortcut
	React.useEffect(() => {
		const down = (e: KeyboardEvent) => {
			if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				setOpen((open) => !open);
			}
		};

		document.addEventListener("keydown", down);
		return () => document.removeEventListener("keydown", down);
	}, []);

	const onSelect = (path: string) => {
		if (!path) return;
		router.push(path);
		setOpen(false);
	};

	const onThemeSelect = (theme: string) => {
		setTheme(theme);
		setOpen(false);
	};

	const allNavigation = [...mainNavigation, ...userNavigation];

	const appearanceOptions = [
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
				<Kbd.Root>
					{/* ⌘K SVG */}
					<svg
						width="19"
						height="10"
						viewBox="0 0 19 10"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<title>Command K</title>
						<path
							d="M2.21282 9.55963C1.86623 9.55963 1.54805 9.4744 1.25828 9.30394C0.968506 9.13065 0.738392 8.90054 0.567938 8.6136C0.397483 8.32383 0.312256 8.00565 0.312256 7.65906C0.312256 7.30963 0.397483 6.99144 0.567938 6.70451C0.738392 6.41474 0.968506 6.18321 1.25828 6.00991C1.54805 5.83662 1.86623 5.74997 2.21282 5.74997H3.15032V4.24144H2.21282C1.86623 4.24144 1.54805 4.15622 1.25828 3.98576C0.968506 3.81531 0.738392 3.58661 0.567938 3.29968C0.397483 3.00991 0.312256 2.69031 0.312256 2.34088C0.312256 1.99144 0.397483 1.67326 0.567938 1.38633C0.738392 1.0994 0.968506 0.870705 1.25828 0.700251C1.54805 0.526955 1.86623 0.440308 2.21282 0.440308C2.56226 0.440308 2.88044 0.526955 3.16737 0.700251C3.45714 0.870705 3.68726 1.0994 3.85771 1.38633C4.03101 1.67326 4.11765 1.99144 4.11765 2.34088V3.26985H5.63044V2.34088C5.63044 1.99144 5.71567 1.67326 5.88612 1.38633C6.05657 1.0994 6.28527 0.870705 6.5722 0.700251C6.86197 0.526955 7.18157 0.440308 7.53101 0.440308C7.88044 0.440308 8.19862 0.526955 8.48555 0.700251C8.77248 0.870705 9.00118 1.0994 9.17163 1.38633C9.34209 1.67326 9.42731 1.99144 9.42731 2.34088C9.42731 2.69031 9.34209 3.00991 9.17163 3.29968C9.00118 3.58661 8.77248 3.81531 8.48555 3.98576C8.19862 4.15622 7.88044 4.24144 7.53101 4.24144H6.59777V5.74997H7.53101C7.88044 5.74997 8.19862 5.83662 8.48555 6.00991C8.77248 6.18321 9.00118 6.41474 9.17163 6.70451C9.34209 6.99144 9.42731 7.30963 9.42731 7.65906C9.42731 8.00565 9.34209 8.32383 9.17163 8.6136C9.00118 8.90054 8.77248 9.13065 8.48555 9.30394C8.19862 9.4744 7.88044 9.55963 7.53101 9.55963C7.18157 9.55963 6.86197 9.4744 6.5722 9.30394C6.28527 9.13065 6.05657 8.90054 5.88612 8.6136C5.71567 8.32383 5.63044 8.00565 5.63044 7.65906V6.72156H4.11765V7.65906C4.11765 8.00565 4.03101 8.32383 3.85771 8.6136C3.68726 8.90054 3.45714 9.13065 3.16737 9.30394C2.88044 9.4744 2.56226 9.55963 2.21282 9.55963ZM2.21282 8.58804C2.38612 8.58804 2.54237 8.54684 2.68157 8.46446C2.82362 8.38207 2.93726 8.26985 3.02248 8.12781C3.10771 7.98576 3.15032 7.82951 3.15032 7.65906V6.72156H2.21282C2.04237 6.72156 1.88612 6.76417 1.74407 6.8494C1.60203 6.93179 1.48839 7.044 1.40316 7.18605C1.32078 7.32809 1.27959 7.48576 1.27959 7.65906C1.27959 7.82951 1.32078 7.98576 1.40316 8.12781C1.48839 8.26985 1.60203 8.38207 1.74407 8.46446C1.88612 8.54684 2.04237 8.58804 2.21282 8.58804ZM2.21282 3.26985H3.15032V2.34088C3.15032 2.16758 3.10771 2.01133 3.02248 1.87213C2.93726 1.73008 2.82362 1.61786 2.68157 1.53548C2.54237 1.45309 2.38612 1.4119 2.21282 1.4119C2.04237 1.4119 1.88612 1.45309 1.74407 1.53548C1.60203 1.61786 1.48839 1.73008 1.40316 1.87213C1.32078 2.01133 1.27959 2.16758 1.27959 2.34088C1.27959 2.51417 1.32078 2.67184 1.40316 2.81389C1.48839 2.95309 1.60203 3.06389 1.74407 3.14627C1.88612 3.22866 2.04237 3.26985 2.21282 3.26985ZM6.59777 3.26985H7.53101C7.7043 3.26985 7.86055 3.22866 7.99976 3.14627C8.13896 3.06389 8.24976 2.95309 8.33214 2.81389C8.41737 2.67184 8.45998 2.51417 8.45998 2.34088C8.45998 2.16758 8.41737 2.01133 8.33214 1.87213C8.24976 1.73008 8.13896 1.61786 7.99976 1.53548C7.86055 1.45309 7.7043 1.4119 7.53101 1.4119C7.35771 1.4119 7.20004 1.45309 7.05799 1.53548C6.91595 1.61786 6.80373 1.73008 6.72135 1.87213C6.63896 2.01133 6.59777 2.16758 6.59777 2.34088V3.26985ZM7.53101 8.58804C7.7043 8.58804 7.86055 8.54684 7.99976 8.46446C8.13896 8.38207 8.24976 8.26985 8.33214 8.12781C8.41737 7.98576 8.45998 7.82951 8.45998 7.65906C8.45998 7.48576 8.41737 7.32809 8.33214 7.18605C8.24976 7.044 8.13896 6.93179 7.99976 6.8494C7.86055 6.76417 7.7043 6.72156 7.53101 6.72156H6.59777V7.65906C6.59777 7.82951 6.63896 7.98576 6.72135 8.12781C6.80373 8.26985 6.91595 8.38207 7.05799 8.46446C7.20004 8.54684 7.35771 8.58804 7.53101 8.58804ZM4.11765 5.74997H5.63044V4.24144H4.11765V5.74997Z"
							fill="#99A0AE"
						/>
						<path
							d="M12.2457 9.3636V0.636331H13.5625V4.80394H13.669L17.3295 0.636331H18.9872L15.4673 4.56531L19 9.3636H17.4148L14.5937 5.46446L13.5625 6.64912V9.3636H12.2457Z"
							fill="#99A0AE"
						/>
					</svg>
				</Kbd.Root>
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
				<CommandMenu.Group>
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

				<CommandMenu.Group>
					{appearanceOptions.map((item) => (
						<CommandMenu.Item
							key={`${item.label} ${item.value}`}
							onSelect={() => onThemeSelect(item.value)}
						>
							<CommandMenu.ItemIcon as={Icon} name={item.icon} />
							{item.label}
						</CommandMenu.Item>
					))}
				</CommandMenu.Group>
			</CommandMenu.List>

			{/* Footer */}
			<CommandMenu.Footer>
				<div className="flex gap-3">
					<div className="flex items-center gap-2">
						<CommandMenu.FooterKeyBox>
							<ArrowUp className="size-4" />
						</CommandMenu.FooterKeyBox>
						<CommandMenu.FooterKeyBox>
							<ArrowDown className="size-4" />
						</CommandMenu.FooterKeyBox>
						<span className="text-paragraph-xs text-text-sub-600">
							Navigate
						</span>
					</div>
					<div className="flex items-center gap-2">
						<CommandMenu.FooterKeyBox>
							<CornerDownLeft className="size-4" />
						</CommandMenu.FooterKeyBox>
						<span className="text-paragraph-xs text-text-sub-600">Select</span>
					</div>
				</div>

				<div className="text-right text-paragraph-xs text-text-sub-600">
					Not what you’re looking for? Try the{" "}
					<LinkButton.Root size="small" variant="primary" underline>
						Help Center
					</LinkButton.Root>
				</div>
			</CommandMenu.Footer>
		</CommandMenu.Dialog>
	);
}
