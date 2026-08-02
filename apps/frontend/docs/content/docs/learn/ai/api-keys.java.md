# API Keys — Java

> Agent-optimized samples for managing Reloop API keys in Java. Index: [api-keys.md](./api-keys.md)

## Auth reminder

- Header: `x-api-key: rl_...`
- Secret shown once on create/rotate

## Create API key

`POST /api/api-key/v1/`

```java
import sh.reloop.ReloopClient;
ReloopClient reloop = new ReloopClient("rl_123456789");

CreateApiKeyParams params = new CreateApiKeyParams();
params.name = "Production Key";
var apiKey = reloop.apiKey.create(params);
System.out.println(apiKey.id + " " + apiKey.key);
```

## List API keys

`GET /api/api-key/v1/`

```java
import sh.reloop.ReloopClient;
ReloopClient reloop = new ReloopClient("rl_123456789");

ApiKeyListParams params = new ApiKeyListParams();
params.page = 1;
params.limit = 10;
params.enabled = true;
var apiKeys = reloop.apiKey.list(params);
System.out.println(apiKeys.total + " " + apiKeys.apiKeys);
```

## Get API key

`GET /api/api-key/v1/:api_key_id`

```java
import sh.reloop.ReloopClient;

ReloopClient reloop = new ReloopClient("rl_123456789");

var apiKey = reloop.apiKey.get("key_123456789");
System.out.println(apiKey.id + " " + apiKey.name + " " + apiKey.enabled);
```

## Update API key

`PATCH /api/api-key/v1/:api_key_id`

```java
import sh.reloop.ReloopClient;
ReloopClient reloop = new ReloopClient("rl_123456789");

UpdateApiKeyParams params = new UpdateApiKeyParams();
params.name = "Updated Key Name";
var apiKey = reloop.apiKey.update("key_123456789", params);
System.out.println(apiKey.id + " " + apiKey.name);
```

## Rotate API key

`POST /api/api-key/v1/rotate/:api_key_id`

```java
import sh.reloop.ReloopClient;

ReloopClient reloop = new ReloopClient("rl_123456789");

var apiKey = reloop.apiKey.rotate("key_123456789");
System.out.println(apiKey.id + " " + apiKey.key);
```

## Disable API key

`POST /api/api-key/v1/disable/:api_key_id`

```java
import sh.reloop.ReloopClient;

ReloopClient reloop = new ReloopClient("rl_123456789");

var apiKey = reloop.apiKey.disable("key_123456789");
System.out.println(apiKey.id + " " + apiKey.enabled);
```

## Enable API key

`POST /api/api-key/v1/enable/:api_key_id`

```java
import sh.reloop.ReloopClient;

ReloopClient reloop = new ReloopClient("rl_123456789");

var apiKey = reloop.apiKey.enable("key_123456789");
System.out.println(apiKey.id + " " + apiKey.enabled);
```

## Delete API key

`DELETE /api/api-key/v1/:api_key_id`

```java
import sh.reloop.ReloopClient;

ReloopClient reloop = new ReloopClient("rl_123456789");

var apiKey = reloop.apiKey.delete("key_123456789");
System.out.println(apiKey.id + " " + apiKey.message);
```
