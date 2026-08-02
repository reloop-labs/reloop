# API Keys — Python

> Agent-optimized samples for managing Reloop API keys in Python. Index: [api-keys.md](./api-keys.md)

## Auth reminder

- Header: `x-api-key: rl_...`
- Secret shown once on create/rotate

## Create API key

`POST /api/api-key/v1/`

```python
from reloop_email import Reloop

reloop = Reloop(api_key="rl_123456789")

result = reloop.api_key.create({
  "name": "Production Key",
})

if result.api_key_error:
    raise result.api_key_error

print(result.api_key["id"], result.api_key["key"])
```

## List API keys

`GET /api/api-key/v1/`

```python
from reloop_email import Reloop

reloop = Reloop(api_key="rl_123456789")

result = reloop.api_key.list({
  "page": 1,
  "limit": 10,
  "enabled": True,
})

if result.api_key_error:
    raise result.api_key_error

print(result.api_keys["total"], result.api_keys["apiKeys"])
```

## Get API key

`GET /api/api-key/v1/:api_key_id`

```python
from reloop_email import Reloop

reloop = Reloop(api_key="rl_123456789")

result = reloop.api_key.get("key_123456789")

if result.api_key_error:
    raise result.api_key_error

print(result.api_key["id"], result.api_key["name"], result.api_key["enabled"])
```

## Update API key

`PATCH /api/api-key/v1/:api_key_id`

```python
from reloop_email import Reloop

reloop = Reloop(api_key="rl_123456789")

result = reloop.api_key.update("key_123456789", {
  "name": "Updated Key Name",
})

if result.api_key_error:
    raise result.api_key_error

print(result.api_key["id"], result.api_key["name"])
```

## Rotate API key

`POST /api/api-key/v1/rotate/:api_key_id`

```python
from reloop_email import Reloop

reloop = Reloop(api_key="rl_123456789")

result = reloop.api_key.rotate("key_123456789")

if result.api_key_error:
    raise result.api_key_error

print(result.api_key["id"], result.api_key["key"])
```

## Disable API key

`POST /api/api-key/v1/disable/:api_key_id`

```python
from reloop_email import Reloop

reloop = Reloop(api_key="rl_123456789")

result = reloop.api_key.disable("key_123456789")

if result.api_key_error:
    raise result.api_key_error

print(result.api_key["id"], result.api_key["enabled"])
```

## Enable API key

`POST /api/api-key/v1/enable/:api_key_id`

```python
from reloop_email import Reloop

reloop = Reloop(api_key="rl_123456789")

result = reloop.api_key.enable("key_123456789")

if result.api_key_error:
    raise result.api_key_error

print(result.api_key["id"], result.api_key["enabled"])
```

## Delete API key

`DELETE /api/api-key/v1/:api_key_id`

```python
from reloop_email import Reloop

reloop = Reloop(api_key="rl_123456789")

result = reloop.api_key.delete("key_123456789")

if result.api_key_error:
    raise result.api_key_error

print(result.api_key["id"], result.api_key["message"])
```
