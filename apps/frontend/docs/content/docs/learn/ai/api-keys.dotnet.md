# API Keys — .NET

> Agent-optimized samples for managing Reloop API keys in .NET. Index: [api-keys.md](./api-keys.md)

## Auth reminder

- Header: `x-api-key: rl_...`
- Secret shown once on create/rotate

## Create API key

`POST /api/api-key/v1/`

```csharp
using Reloop;
using Reloop.Models;

var reloop = new ReloopClient("rl_123456789");

var apiKey = await reloop.ApiKeys.CreateAsync(new CreateApiKeyParams(Name: "Production Key"));
```

## List API keys

`GET /api/api-key/v1/`

```csharp
using Reloop;
using Reloop.Models;

var reloop = new ReloopClient("rl_123456789");

var apiKeys = await reloop.ApiKeys.ListAsync(new ApiKeyListParams
{
    Page = 1,
    Limit = 10,
});
```

## Get API key

`GET /api/api-key/v1/:api_key_id`

```csharp
using Reloop;
using Reloop.Models;

var reloop = new ReloopClient("rl_123456789");

await reloop.ApiKeys.GetAsync("key_123456789");
```

## Update API key

`PATCH /api/api-key/v1/:api_key_id`

```csharp
using Reloop;
using Reloop.Models;

var reloop = new ReloopClient("rl_123456789");

var apiKey = await reloop.ApiKeys.UpdateAsync("key_123456789", new UpdateApiKeyParams(Name: "Updated Key Name"));
```

## Rotate API key

`POST /api/api-key/v1/rotate/:api_key_id`

```csharp
using Reloop;
using Reloop.Models;

var reloop = new ReloopClient("rl_123456789");

await reloop.ApiKeys.RotateAsync("key_123456789");
```

## Disable API key

`POST /api/api-key/v1/disable/:api_key_id`

```csharp
using Reloop;
using Reloop.Models;

var reloop = new ReloopClient("rl_123456789");

await reloop.ApiKeys.DisableAsync("key_123456789");
```

## Enable API key

`POST /api/api-key/v1/enable/:api_key_id`

```csharp
using Reloop;
using Reloop.Models;

var reloop = new ReloopClient("rl_123456789");

await reloop.ApiKeys.EnableAsync("key_123456789");
```

## Delete API key

`DELETE /api/api-key/v1/:api_key_id`

```csharp
using Reloop;
using Reloop.Models;

var reloop = new ReloopClient("rl_123456789");

await reloop.ApiKeys.DeleteAsync("key_123456789");
```
