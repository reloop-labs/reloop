"use client";
import { PasswordChange } from "@dashboard/components/password-change";
import { SessionManagement } from "@dashboard/components/session-management";
import { useLayout } from "@dashboard/providers/layout-provider";
import { Icon } from "@reloop/ui/icon";

const SecurityPage = () => {
	const { layoutMode } = useLayout();
	const isTopbar = layoutMode === "topbar";
	return (
		<div className="space-y-8">
			{isTopbar && (
				<div className="border-stroke-soft-100 border-b pt-5 pb-7">
					<div className="flex items-center gap-2">
						<Icon name="shield-check" className="h-5 w-5" />
						<p className="font-medium text-2xl text-text-strong-950">
							Security
						</p>
					</div>
					<p className="text-paragraph-sm text-text-sub-600">
						Manage your account security and active sessions
					</p>
				</div>
			)}
			<div>
				<div>
					<PasswordChange />
				</div>
				<div>
					<SessionManagement />
				</div>
			</div>
		</div>
	);
};

export default SecurityPage;
