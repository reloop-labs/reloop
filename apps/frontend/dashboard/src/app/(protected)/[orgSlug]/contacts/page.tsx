"use client";
import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import { useQueryState } from "nuqs";
import { useState } from "react";
import { AddContactModal } from "./components/add-contact-modal";
import { AddPropertyModal } from "./components/add-property-modal";
import { ContactList } from "./components/contact-list";
import { ContactsTabs } from "./components/contacts-tabs";
import { PropertyList } from "./components/property-list";

const ContactsPage = () => {
	useUserOrganization();
	const [tabValue] = useQueryState("tab", { defaultValue: "contacts" });

	// Contact Modal State
	const [isContactModalOpen, setIsContactModalOpen] = useState(false);

	// Property Modal State
	const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);

	return (
		<div className="mx-auto max-w-3xl sm:px-8">
			{/* Header */}
			<div className="flex items-center justify-between pt-10">
				<p className="font-medium text-2xl">Contacts</p>
				<div className="flex items-center gap-2">
					{tabValue === "contacts" ? (
						<Button.Root
							variant="neutral"
							size="xsmall"
							onClick={() => setIsContactModalOpen(true)}
						>
							<Icon name="plus" className="h-4 w-4" />
							Add contact
						</Button.Root>
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
