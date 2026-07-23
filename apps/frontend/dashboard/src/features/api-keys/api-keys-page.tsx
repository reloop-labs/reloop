import { CommonUseCasesSidebar } from "./common-use-cases-sidebar";
import { ApiKeyList } from "./list/api-key-list";
import { ApiKeyListHeader } from "./list/api-key-list-header";

export function ApiKeysPage() {
	return (
		<div className="mx-auto max-w-6xl space-y-6 p-6 lg:p-8">
			<ApiKeyListHeader />
			<div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
				<div className="lg:col-span-8 xl:col-span-8">
					<ApiKeyList />
				</div>
				<div className="lg:col-span-4 xl:col-span-4">
					<CommonUseCasesSidebar />
				</div>
			</div>
		</div>
	);
}
