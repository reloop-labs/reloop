export const codeExamples = {
	javascript: {
		create: `import { Reloop } from "reloop-email";

const reloop = new Reloop({ apiKey: "rl_123456789" });

const { apiKey, apiKeyError } = await reloop.apiKey.create({
  name: "Production Key",
});

if (apiKeyError) throw apiKeyError;

console.log(apiKey.id, apiKey.key);`,
		list: `import { Reloop } from "reloop-email";

const reloop = new Reloop({ apiKey: "rl_123456789" });

const { apiKeys, apiKeyError } = await reloop.apiKey.list({
  page: 1,
  limit: 10,
  enabled: true,
});

if (apiKeyError) throw apiKeyError;

console.log(apiKeys.total, apiKeys.apiKeys);`,
		rotate: `import { Reloop } from "reloop-email";

const reloop = new Reloop({ apiKey: "rl_123456789" });

const { apiKey, apiKeyError } = await reloop.apiKey.rotate("key_123456789");

if (apiKeyError) throw apiKeyError;

console.log(apiKey.id, apiKey.key);`,
		disable: `import { Reloop } from "reloop-email";

const reloop = new Reloop({ apiKey: "rl_123456789" });

const { apiKey, apiKeyError } = await reloop.apiKey.disable("key_123456789");

if (apiKeyError) throw apiKeyError;

console.log(apiKey.id, apiKey.enabled);`,
	},
	python: {
		create: `from reloop import Reloop

reloop = Reloop(api_key="rl_123456789")

api_key = reloop.api_keys.create(name="Production Key")
print(api_key.id, api_key.key)`,
		list: `from reloop import Reloop

reloop = Reloop(api_key="rl_123456789")

api_keys = reloop.api_keys.list(page=1, limit=10)
print(api_keys)`,
		rotate: `from reloop import Reloop

reloop = Reloop(api_key="rl_123456789")

api_key = reloop.api_keys.rotate("key_123456789")
print(api_key.id, api_key.key)`,
		disable: `from reloop import Reloop

reloop = Reloop(api_key="rl_123456789")

api_key = reloop.api_keys.disable("key_123456789")
print(api_key.id, api_key.enabled)`,
	},
	php: {
		create: `<?php
$reloop = Reloop::client('rl_123456789');

$apiKey = $reloop->apiKeys->create(['name' => 'Production Key']);
echo $apiKey->id;
?>`,
		list: `<?php
$reloop = Reloop::client('rl_123456789');

$apiKeys = $reloop->apiKeys->list(['page' => 1, 'limit' => 10]);
?>`,
		rotate: `<?php
$reloop = Reloop::client('rl_123456789');

$apiKey = $reloop->apiKeys->rotate('key_123456789');
?>`,
		disable: `<?php
$reloop = Reloop::client('rl_123456789');

$apiKey = $reloop->apiKeys->disable('key_123456789');
?>`,
	},
};
