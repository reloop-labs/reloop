import * as Modal from "@reloop/ui/modal";

export const ModalHeader = ({ groupName }: { groupName: string }) => (
	<div className="border-stroke-soft-100 border-b px-5 pt-3.5 pb-2 dark:border-stroke-soft-100/40">
		<div className="flex items-center gap-4">
			<div>
				<Modal.Title className="font-medium text-text-strong-950 text-title-h5 dark:text-white">
					Manage contacts in{" "}
					<span className="text-primary-base">{groupName || "group"}</span>
				</Modal.Title>
				<Modal.Description className="hidden">
					Manage contacts in this group.
				</Modal.Description>
			</div>
		</div>
	</div>
);
