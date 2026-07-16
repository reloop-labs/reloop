import { ApiKeyList } from "./api-key-list";
import { ApiKeyListHeader } from "./api-key-list-header";

export function ApiKeysPage() {
	return (
		<div className="mx-auto max-w-3xl space-y-6 p-6 lg:p-8">
			<ApiKeyListHeader />
			<ApiKeyList />
		</div>
	);
}
