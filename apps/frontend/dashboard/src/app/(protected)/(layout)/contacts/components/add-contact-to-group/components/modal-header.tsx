"use client";

import { Icon } from "@reloop/ui/icon";
import * as Modal from "@reloop/ui/modal";

export const ModalHeader = ({ groupName }: { groupName: string }) => (
	<div className="border-stroke-soft-100 border-b p-5 dark:border-stroke-soft-100/20">
		<div className="flex items-center gap-4">
			<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-base/10 dark:bg-primary-base/20">
				<Icon name="user-plus" className="h-5 w-5 text-primary-base" />
			</div>
			<div>
				<Modal.Title className="font-medium text-text-strong-950 text-title-h5 dark:text-white">
					Add contacts to{" "}
					<span className="text-primary-base">{groupName || "group"}</span>
				</Modal.Title>
				<Modal.Description className="hidden">
					Select contacts from your database to add them to this group.
				</Modal.Description>
			</div>
		</div>
	</div>
);
