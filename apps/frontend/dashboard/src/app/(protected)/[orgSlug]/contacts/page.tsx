"use client";
import { AnimatedHoverBackground } from "@fe/dashboard/components/layout/sidebar/animated-hover-background";
import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import {
	Content as PopoverContent,
	Root as PopoverRoot,
	Trigger as PopoverTrigger,
} from "@reloop/ui/popover";
import Link from "next/link";
import { useQueryState } from "nuqs";
import { useRef, useState } from "react";
import { AddContactModal } from "./components/add-contact-modal";
import { AddPropertyModal } from "./components/add-property-modal";
import { ContactList } from "./components/contact-list";
import { ContactsTabs } from "./components/contacts-tabs";
import { PropertyList } from "./components/property-list";

const ContactsPage = () => {
	const { activeOrganization } = useUserOrganization();
	const [tabValue] = useQueryState("tab", { defaultValue: "contacts" });

	// Contact Modal State
	const [isContactModalOpen, setIsContactModalOpen] = useState(false);

	// Property Modal State
	const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);

	// Popover hover state
	const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
	const buttonRefs = useRef<(HTMLButtonElement | HTMLAnchorElement)[]>([]);
	const currentTab = buttonRefs.current[hoverIdx ?? -1];
	const currentRect = currentTab?.getBoundingClientRect();

	return (
		<div className="mx-auto max-w-3xl sm:px-8">
			{/* Header */}
			<div className="flex items-center justify-between pt-10">
				<p className="font-medium text-2xl">Contacts</p>
				<div className="flex items-center gap-2">
					{tabValue === "contacts" ? (
						<PopoverRoot>
							<PopoverTrigger asChild>
								<Button.Root variant="neutral" size="xsmall">
									<Icon name="plus" className="h-4 w-4" />
									Add contact
								</Button.Root>
							</PopoverTrigger>
							<PopoverContent
								align="end"
								side="bottom"
								className="w-44 p-1.5"
								sideOffset={3}
							>
								<div className="relative">
									<button
										ref={(el) => {
											if (el) buttonRefs.current[0] = el;
										}}
										type="button"
										onPointerEnter={() => setHoverIdx(0)}
										onPointerLeave={() => setHoverIdx(undefined)}
										onClick={() => setIsContactModalOpen(true)}
										className={cn(
											"flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 font-normal text-text-strong-950 text-xs transition-colors",
											!currentRect && hoverIdx === 0 && "bg-neutral-alpha-10",
										)}
									>
										<Icon
											name="user-plus"
											className="h-3.5 w-3.5 text-text-sub-600"
										/>
										<span>Add Single Contact</span>
									</button>
									<Link
										ref={(el) => {
											if (el) buttonRefs.current[1] = el;
										}}
										href={`/${activeOrganization?.slug}/contacts/bulk-import`}
										onPointerEnter={() => setHoverIdx(1)}
										onPointerLeave={() => setHoverIdx(undefined)}
										className={cn(
											"flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 font-normal text-text-strong-950 text-xs transition-colors",
											!currentRect && hoverIdx === 1 && "bg-neutral-alpha-10",
										)}
									>
										<Icon
											name="file-upload"
											className="h-3.5 w-3.5 text-text-sub-600"
										/>
										<span>Bulk Import (CSV)</span>
									</Link>
									<AnimatedHoverBackground
										rect={currentRect}
										tabElement={currentTab}
									/>
								</div>
							</PopoverContent>
						</PopoverRoot>
					) : (
						<Button.Root
							variant="neutral"
							size="xsmall"
							onClick={() => setIsPropertyModalOpen(true)}
						>
							<Icon name="plus" className="h-4 w-4" />
							Add property
						</Button.Root>
					)}
				</div>
			</div>

			{/* Tabs */}
			<div className="mt-6">
				<ContactsTabs />
			</div>

			{/* Content based on tab */}
			<div className="mt-4">
				{tabValue === "contacts" ? (
					<ContactList onAddContact={() => setIsContactModalOpen(true)} />
				) : (
					<PropertyList onAddProperty={() => setIsPropertyModalOpen(true)} />
				)}
			</div>

			{/* Add Contacts Modal */}
			<AddContactModal
				open={isContactModalOpen}
				onOpenChange={setIsContactModalOpen}
			/>

			{/* Add Property Modal */}
			<AddPropertyModal
				open={isPropertyModalOpen}
				onOpenChange={setIsPropertyModalOpen}
			/>
		</div>
	);
};

export default ContactsPage;
