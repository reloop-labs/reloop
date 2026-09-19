local kumo = require 'kumo'
local utils = require 'policy.utils'
utils.init(kumo)

kumo.on('init', function()
  local file = assert(io.open('/fixtures/fixtures.json', 'r'))
  local fixtures = kumo.serde.json_parse(file:read('a'))
  file:close()

  local results = {}
  for name, raw in pairs(fixtures) do
    results[name] = utils.inject_tracking(raw, 'log_test_1', '', true, true)
  end

  print('TOKEN_PARITY ' .. kumo.serde.json_encode({
    tracked = utils.encode_tracking_token('log_test_1', 'https://example.com/a', true),
    untracked = utils.encode_tracking_token('log_test_1', 'https://example.com/a', false),
  }))
  print('INJECT_TRACKING_RESULTS ' .. kumo.serde.json_encode(results))
  os.exit(0)
end)
