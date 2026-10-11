/**
 * Last-known settings nav permissions, so the settings sidebar paints the same
 * rows before the member role / billing queries resolve (no rows popping in).
 *
 * Mirrored onto `<html>` as `data-settings-org-admin` / `data-settings-billing`
 * (pre-paint, see `SETTINGS_NAV_PRE_PAINT_SCRIPT`) so the SSR'd loading chrome
 * can show the right rows with CSS alone. First visit has no cache and stays
 * fail-closed, matching `useOrgPermissions`.
 */
export type SettingsNavPerms = {
	isOrgAdmin: boolean;
	canManageTeam: boolean;
	canManageBilling: boolean;
};

const STORAGE_KEY = "settingsNavPerms";

export const SETTINGS_NAV_PRE_PAINT_SCRIPT = `try{var p=JSON.parse(localStorage.getItem("${STORAGE_KEY}")||"null");if(p){var d=document.documentElement.dataset;if(p.isOrgAdmin)d.settingsOrgAdmin="true";if(p.canManageBilling)d.settingsBilling="true"}}catch(e){}`;

export function readSettingsNavPerms(): SettingsNavPerms | null {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return null;
		const parsed = JSON.parse(raw) as Partial<SettingsNavPerms>;
		return {
			isOrgAdmin: Boolean(parsed.isOrgAdmin),
			canManageTeam: Boolean(parsed.canManageTeam),
			canManageBilling: Boolean(parsed.canManageBilling),
		};
	} catch {
		return null;
	}
}

export function writeSettingsNavPerms(perms: SettingsNavPerms) {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(perms));
		const d = document.documentElement.dataset;
		if (perms.isOrgAdmin) d.settingsOrgAdmin = "true";
		else delete d.settingsOrgAdmin;
		if (perms.canManageBilling) d.settingsBilling = "true";
		else delete d.settingsBilling;
	} catch {}
}
