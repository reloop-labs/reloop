import { ApiKeysResourcesBanner } from "./api-keys-resources-banner";
import { ApiKeyList } from "./list/api-key-list";
import { ApiKeyListHeader } from "./list/api-key-list-header";

export function ApiKeysPage() {
	return (
		<div className="mx-auto max-w-7xl space-y-6 p-6 lg:p-8">
			<ApiKeyListHeader />
			<ApiKeysResourcesBanner />
			<ApiKeyList />
		</div>
	);
}
