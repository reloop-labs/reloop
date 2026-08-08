import * as Modal from "@reloop/ui/modal";

export const ModalHeader = ({
	groupName,
	memberCount,
}: {
	groupName: string;
	memberCount: number;
}) => (
	<div className="border-stroke-soft-100 border-b px-6 pt-5 pb-4 dark:border-stroke-soft-100/40">
		<Modal.Title className="font-semibold text-[22px] text-text-strong-950 tracking-tight">
			Add contacts to group
		</Modal.Title>
		<Modal.Description className="mt-1 text-sm text-text-sub-600 leading-relaxed">
			{groupName ? (
				<>
					Select contacts to add to{" "}
					<span className="font-medium text-text-strong-950">{groupName}</span>
					{memberCount > 0 ? (
						<> · {memberCount.toLocaleString()} already in group</>
					) : null}
					.
				</>
			) : (
				"Select contacts to add to this group."
			)}
		</Modal.Description>
	</div>
);
