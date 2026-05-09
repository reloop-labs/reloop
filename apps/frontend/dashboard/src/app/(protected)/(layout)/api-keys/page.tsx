"use client";

import { ApiKeyList } from "./components/api-key-list";
import { ApiKeyListHeader } from "./components/api-key-list-header";

const ApiKeysPage = () => {
	return (
		<div className="mx-auto max-w-3xl sm:px-8">
			<ApiKeyListHeader />
			<ApiKeyList />
		</div>
	);
};

export default ApiKeysPage;
