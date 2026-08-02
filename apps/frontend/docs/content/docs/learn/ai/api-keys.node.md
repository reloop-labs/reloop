# API Keys — Node

> Agent-optimized samples for managing Reloop API keys in Node. Index: [api-keys.md](./api-keys.md)

## Auth reminder

- Header: `x-api-key: rl_...`
- Secret shown once on create/rotate

## Create API key

`POST /api/api-key/v1/`

```javascript
import { Reloop } from "reloop-email";

const reloop = new Reloop({ apiKey: "rl_123456789" });

const { apiKey, apiKeyError } = await reloop.apiKey.create({
  name: "Production Key",
});

if (apiKeyError) throw apiKeyError;

console.log(apiKey.id, apiKey.key);
```

## List API keys

`GET /api/api-key/v1/`

```javascript
import { Reloop } from "reloop-email";

const reloop = new Reloop({ apiKey: "rl_123456789" });

const { apiKeys, apiKeyError } = await reloop.apiKey.list({
  page: 1,
  limit: 10,
  enabled: true,
});

if (apiKeyError) throw apiKeyError;

console.log(apiKeys.total, apiKeys.apiKeys);
```

## Get API key

`GET /api/api-key/v1/:api_key_id`

```javascript
import { Reloop } from "reloop-email";

const reloop = new Reloop({ apiKey: "rl_123456789" });

const { apiKey, apiKeyError } = await reloop.apiKey.get("key_123456789");

if (apiKeyError) throw apiKeyError;

console.log(apiKey.id, apiKey.name, apiKey.enabled);
```

## Update API key

`PATCH /api/api-key/v1/:api_key_id`

```javascript
import { Reloop } from "reloop-email";

const reloop = new Reloop({ apiKey: "rl_123456789" });

const { apiKey, apiKeyError } = await reloop.apiKey.update("key_123456789", {
  name: "Updated Key Name",
});

if (apiKeyError) throw apiKeyError;

console.log(apiKey.id, apiKey.name);
```

## Rotate API key

`POST /api/api-key/v1/rotate/:api_key_id`

```javascript
import { Reloop } from "reloop-email";

const reloop = new Reloop({ apiKey: "rl_123456789" });

const { apiKey, apiKeyError } = await reloop.apiKey.rotate("key_123456789");

if (apiKeyError) throw apiKeyError;

console.log(apiKey.id, apiKey.key);
```

## Disable API key

`POST /api/api-key/v1/disable/:api_key_id`

```javascript
import { Reloop } from "reloop-email";

const reloop = new Reloop({ apiKey: "rl_123456789" });

const { apiKey, apiKeyError } = await reloop.apiKey.disable("key_123456789");

if (apiKeyError) throw apiKeyError;

console.log(apiKey.id, apiKey.enabled);
```

## Enable API key

`POST /api/api-key/v1/enable/:api_key_id`

```javascript
import { Reloop } from "reloop-email";

const reloop = new Reloop({ apiKey: "rl_123456789" });

const { apiKey, apiKeyError } = await reloop.apiKey.enable("key_123456789");

if (apiKeyError) throw apiKeyError;

console.log(apiKey.id, apiKey.enabled);
```

## Delete API key

`DELETE /api/api-key/v1/:api_key_id`

```javascript
import { Reloop } from "reloop-email";

const reloop = new Reloop({ apiKey: "rl_123456789" });

const { apiKey, apiKeyError } = await reloop.apiKey.delete("key_123456789");

if (apiKeyError) throw apiKeyError;

console.log(apiKey.id, apiKey.message);
```
