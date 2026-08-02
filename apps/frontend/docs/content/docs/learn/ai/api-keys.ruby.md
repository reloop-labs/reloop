# API Keys — Ruby

> Agent-optimized samples for managing Reloop API keys in Ruby. Index: [api-keys.md](./api-keys.md)

## Auth reminder

- Header: `x-api-key: rl_...`
- Secret shown once on create/rotate

## Create API key

`POST /api/api-key/v1/`

```ruby
require "reloop"

reloop = Reloop::Client.new(api_key: "rl_123456789")

api_key = reloop.api_keys.create(name: "Production Key")
```

## List API keys

`GET /api/api-key/v1/`

```ruby
require "reloop"

reloop = Reloop::Client.new(api_key: "rl_123456789")

api_keys = reloop.api_keys.list(page: 1, limit: 10)
```

## Get API key

`GET /api/api-key/v1/:api_key_id`

```ruby
require "reloop"

reloop = Reloop::Client.new(api_key: "rl_123456789")

reloop.api_keys.get("key_123456789")
```

## Update API key

`PATCH /api/api-key/v1/:api_key_id`

```ruby
require "reloop"

reloop = Reloop::Client.new(api_key: "rl_123456789")

api_key = reloop.api_keys.update("key_123456789", name: "Updated Key Name")
```

## Rotate API key

`POST /api/api-key/v1/rotate/:api_key_id`

```ruby
require "reloop"

reloop = Reloop::Client.new(api_key: "rl_123456789")

reloop.api_keys.rotate("key_123456789")
```

## Disable API key

`POST /api/api-key/v1/disable/:api_key_id`

```ruby
require "reloop"

reloop = Reloop::Client.new(api_key: "rl_123456789")

reloop.api_keys.disable("key_123456789")
```

## Enable API key

`POST /api/api-key/v1/enable/:api_key_id`

```ruby
require "reloop"

reloop = Reloop::Client.new(api_key: "rl_123456789")

reloop.api_keys.enable("key_123456789")
```

## Delete API key

`DELETE /api/api-key/v1/:api_key_id`

```ruby
require "reloop"

reloop = Reloop::Client.new(api_key: "rl_123456789")

reloop.api_keys.delete("key_123456789")
```
