# API Keys — Go

> Agent-optimized samples for managing Reloop API keys in Go. Index: [api-keys.md](./api-keys.md)

## Auth reminder

- Header: `x-api-key: rl_...`
- Secret shown once on create/rotate

## Create API key

`POST /api/api-key/v1/`

```go
import reloop "github.com/reloop-labs/reloop-go"

client, _ := reloop.NewClient(reloop.ClientOptions{
    APIKey: "rl_123456789",
})

apiKey, _ := client.ApiKeys.Create(reloop.CreateApiKeyParams{
    Name: "Production Key",
})
```

## List API keys

`GET /api/api-key/v1/`

```go
import reloop "github.com/reloop-labs/reloop-go"

client, _ := reloop.NewClient(reloop.ClientOptions{
    APIKey: "rl_123456789",
})

apiKeys, _ := client.ApiKeys.List(&reloop.ApiKeyListParams{
    Page: reloop.Int(1),
    Limit: reloop.Int(10),
})
```

## Get API key

`GET /api/api-key/v1/:api_key_id`

```go
import reloop "github.com/reloop-labs/reloop-go"

client, _ := reloop.NewClient(reloop.ClientOptions{
    APIKey: "rl_123456789",
})

_, _ = client.ApiKeys.Get("key_123456789")
```

## Update API key

`PATCH /api/api-key/v1/:api_key_id`

```go
import reloop "github.com/reloop-labs/reloop-go"

client, _ := reloop.NewClient(reloop.ClientOptions{
    APIKey: "rl_123456789",
})

apiKey, _ := client.ApiKeys.Update("key_123456789", reloop.UpdateApiKeyParams{
    Name: "Updated Key Name",
})
```

## Rotate API key

`POST /api/api-key/v1/rotate/:api_key_id`

```go
import reloop "github.com/reloop-labs/reloop-go"

client, _ := reloop.NewClient(reloop.ClientOptions{
    APIKey: "rl_123456789",
})

_, _ = client.ApiKeys.Rotate("key_123456789")
```

## Disable API key

`POST /api/api-key/v1/disable/:api_key_id`

```go
import reloop "github.com/reloop-labs/reloop-go"

client, _ := reloop.NewClient(reloop.ClientOptions{
    APIKey: "rl_123456789",
})

_, _ = client.ApiKeys.Disable("key_123456789")
```

## Enable API key

`POST /api/api-key/v1/enable/:api_key_id`

```go
import reloop "github.com/reloop-labs/reloop-go"

client, _ := reloop.NewClient(reloop.ClientOptions{
    APIKey: "rl_123456789",
})

_, _ = client.ApiKeys.Enable("key_123456789")
```

## Delete API key

`DELETE /api/api-key/v1/:api_key_id`

```go
import reloop "github.com/reloop-labs/reloop-go"

client, _ := reloop.NewClient(reloop.ClientOptions{
    APIKey: "rl_123456789",
})

_, _ = client.ApiKeys.Delete("key_123456789")
```
