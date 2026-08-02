# API Keys — cURL

> Agent-optimized samples for managing Reloop API keys in cURL. Index: [api-keys.md](./api-keys.md)

## Auth reminder

- Header: `x-api-key: rl_...`
- Secret shown once on create/rotate

## Create API key

`POST /api/api-key/v1/`

```bash
curl -X POST https://reloop.sh/api/api-key/v1/ \
  -H "x-api-key: rl_123456789" \
  -H "Content-Type: application/json" \
  -d '{"name": "Production Key"}'
```

## List API keys

`GET /api/api-key/v1/`

```bash
curl "https://reloop.sh/api/api-key/v1/?page=1&limit=10" \
  -H "x-api-key: rl_123456789"
```

## Get API key

`GET /api/api-key/v1/:api_key_id`

```bash
curl "https://reloop.sh/api/api-key/v1/key_123456789" \
  -H "x-api-key: rl_123456789"
```

## Update API key

`PATCH /api/api-key/v1/:api_key_id`

```bash
curl -X PATCH https://reloop.sh/api/api-key/v1/key_123456789 \
  -H "x-api-key: rl_123456789" \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Key Name"}'
```

## Rotate API key

`POST /api/api-key/v1/rotate/:api_key_id`

```bash
curl -X POST https://reloop.sh/api/api-key/v1/rotate/key_123456789 \
  -H "x-api-key: rl_123456789"
```

## Disable API key

`POST /api/api-key/v1/disable/:api_key_id`

```bash
curl -X POST https://reloop.sh/api/api-key/v1/disable/key_123456789 \
  -H "x-api-key: rl_123456789"
```

## Enable API key

`POST /api/api-key/v1/enable/:api_key_id`

```bash
curl -X POST https://reloop.sh/api/api-key/v1/enable/key_123456789 \
  -H "x-api-key: rl_123456789"
```

## Delete API key

`DELETE /api/api-key/v1/:api_key_id`

```bash
curl -X DELETE https://reloop.sh/api/api-key/v1/key_123456789 \
  -H "x-api-key: rl_123456789"
```
