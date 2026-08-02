# API Keys — Rust

> Agent-optimized samples for managing Reloop API keys in Rust. Index: [api-keys.md](./api-keys.md)

## Auth reminder

- Header: `x-api-key: rl_...`
- Secret shown once on create/rotate

## Create API key

`POST /api/api-key/v1/`

```rust
use reloop::ReloopClient;
#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let reloop = ReloopClient::new("rl_123456789".to_string(), None);

    reloop.api_keys().create(CreateApiKeyParams {
        name: "Production Key".to_string(),
    }).await?;

    Ok(())
}
```

## List API keys

`GET /api/api-key/v1/`

```rust
use reloop::ReloopClient;
#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let reloop = ReloopClient::new("rl_123456789".to_string(), None);

    reloop.api_keys().list(Some(ApiKeyListParams {
        page: Some(1),
        limit: Some(10),
        ..Default::default()
    })).await?;

    Ok(())
}
```

## Get API key

`GET /api/api-key/v1/:api_key_id`

```rust
use reloop::ReloopClient;
#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let reloop = ReloopClient::new("rl_123456789".to_string(), None);

    reloop.api_keys().get("key_123456789").await?;

    Ok(())
}
```

## Update API key

`PATCH /api/api-key/v1/:api_key_id`

```rust
use reloop::ReloopClient;
#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let reloop = ReloopClient::new("rl_123456789".to_string(), None);

    reloop.api_keys().update("key_123456789", UpdateApiKeyParams {
        name: "Updated Key Name".to_string(),
    }).await?;

    Ok(())
}
```

## Rotate API key

`POST /api/api-key/v1/rotate/:api_key_id`

```rust
use reloop::ReloopClient;
#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let reloop = ReloopClient::new("rl_123456789".to_string(), None);

    reloop.api_keys().rotate("key_123456789").await?;

    Ok(())
}
```

## Disable API key

`POST /api/api-key/v1/disable/:api_key_id`

```rust
use reloop::ReloopClient;
#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let reloop = ReloopClient::new("rl_123456789".to_string(), None);

    reloop.api_keys().disable("key_123456789").await?;

    Ok(())
}
```

## Enable API key

`POST /api/api-key/v1/enable/:api_key_id`

```rust
use reloop::ReloopClient;
#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let reloop = ReloopClient::new("rl_123456789".to_string(), None);

    reloop.api_keys().enable("key_123456789").await?;

    Ok(())
}
```

## Delete API key

`DELETE /api/api-key/v1/:api_key_id`

```rust
use reloop::ReloopClient;
#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let reloop = ReloopClient::new("rl_123456789".to_string(), None);

    reloop.api_keys().delete("key_123456789").await?;

    Ok(())
}
```
