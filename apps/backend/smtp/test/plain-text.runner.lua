local kumo = require 'kumo'
local utils = require 'policy.utils'
utils.init(kumo)

-- Mirrors apply_reloop_logic: flag -> add backend's text part -> tracking.
kumo.on('init', function()
  local file = assert(io.open('/fixtures/fixtures.json', 'r'))
  local fixtures = kumo.serde.json_parse(file:read('a'))
  file:close()

  local results = {}
  for name, fixture in pairs(fixtures) do
    local data = fixture.raw
    local needs = utils.needs_plain_text(data)
    if needs then
      data = utils.add_plain_text(data, fixture.text, 'reloop-alt-test')
    end
    results[name] = {
      needs = needs,
      raw = utils.inject_tracking(data, 'log_test_1', '', true, true),
    }
  end

  print('PLAIN_TEXT_RESULTS ' .. kumo.serde.json_encode(results))
  os.exit(0)
end)
