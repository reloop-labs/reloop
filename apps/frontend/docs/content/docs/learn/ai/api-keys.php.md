# API Keys — PHP

> Agent-optimized samples for managing Reloop API keys in PHP. Index: [api-keys.md](./api-keys.md)

## Auth reminder

- Header: `x-api-key: rl_...`
- Secret shown once on create/rotate

## Create API key

`POST /api/api-key/v1/`

```php
<?php

require 'vendor/autoload.php';

use Reloop\Reloop;

$reloop = Reloop::client('rl_123456789');

$apiKey = $reloop->apiKey->create([
    'name' => 'Production Key',
]);
echo $apiKey['id'] . ' ' . $apiKey['key'] . PHP_EOL;
```

## List API keys

`GET /api/api-key/v1/`

```php
<?php

require 'vendor/autoload.php';

use Reloop\Reloop;

$reloop = Reloop::client('rl_123456789');

$apiKeys = $reloop->apiKey->list([
    'page' => 1,
    'limit' => 10,
    'enabled' => true,
]);
echo $apiKeys['total'] . ' ' . $apiKeys['apiKeys'] . PHP_EOL;
```

## Get API key

`GET /api/api-key/v1/:api_key_id`

```php
<?php

require 'vendor/autoload.php';

use Reloop\Reloop;

$reloop = Reloop::client('rl_123456789');

$apiKey = $reloop->apiKey->get('key_123456789');
echo $apiKey['id'] . ' ' . $apiKey['name'] . ' ' . $apiKey['enabled'] . PHP_EOL;
```

## Update API key

`PATCH /api/api-key/v1/:api_key_id`

```php
<?php

require 'vendor/autoload.php';

use Reloop\Reloop;

$reloop = Reloop::client('rl_123456789');

$apiKey = $reloop->apiKey->update('key_123456789', [
    'name' => 'Updated Key Name',
]);
echo $apiKey['id'] . ' ' . $apiKey['name'] . PHP_EOL;
```

## Rotate API key

`POST /api/api-key/v1/rotate/:api_key_id`

```php
<?php

require 'vendor/autoload.php';

use Reloop\Reloop;

$reloop = Reloop::client('rl_123456789');

$apiKey = $reloop->apiKey->rotate('key_123456789');
echo $apiKey['id'] . ' ' . $apiKey['key'] . PHP_EOL;
```

## Disable API key

`POST /api/api-key/v1/disable/:api_key_id`

```php
<?php

require 'vendor/autoload.php';

use Reloop\Reloop;

$reloop = Reloop::client('rl_123456789');

$apiKey = $reloop->apiKey->disable('key_123456789');
echo $apiKey['id'] . ' ' . $apiKey['enabled'] . PHP_EOL;
```

## Enable API key

`POST /api/api-key/v1/enable/:api_key_id`

```php
<?php

require 'vendor/autoload.php';

use Reloop\Reloop;

$reloop = Reloop::client('rl_123456789');

$apiKey = $reloop->apiKey->enable('key_123456789');
echo $apiKey['id'] . ' ' . $apiKey['enabled'] . PHP_EOL;
```

## Delete API key

`DELETE /api/api-key/v1/:api_key_id`

```php
<?php

require 'vendor/autoload.php';

use Reloop\Reloop;

$reloop = Reloop::client('rl_123456789');

$apiKey = $reloop->apiKey->delete('key_123456789');
echo $apiKey['id'] . ' ' . $apiKey['message'] . PHP_EOL;
```
