"use client";

import { ApiKeyList } from "./components/api-key-list";
import { ApiKeyListHeader } from "./components/api-key-list-header";

const ApiKeysPage = () => {
	return (
		<div className="mx-auto max-w-3xl space-y-8 p-6 lg:p-8">
			<ApiKeyListHeader />
			<ApiKeyList />
		</div>
	);
};

export default ApiKeysPage;
