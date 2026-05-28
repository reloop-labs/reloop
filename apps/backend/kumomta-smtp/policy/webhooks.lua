local kumo = require 'kumo'
local log_hooks = require 'policy-extras.log_hooks'
local constants = require 'policy.constants'

local nats_client
local function get_nats_client()
  if not nats_client then
    nats_client = kumo.nats.connect {
      servers = { constants.nats_url },
    }
  end
  return nats_client
end

log_hooks:new {
  name = 'webhook',
  log_parameters = {
    headers = { 'Subject', 'X-Email-Log-ID' },
    meta = { 'X-Email-Log-ID' },
  },
  constructor = function(domain, tenant, campaign)
    local connection = {}

    function connection:send(message)
      local nc = get_nats_client()
      local ok, err = pcall(function()
        nc:publish {
          subject = 'kumomta.event',
          payload = message:get_data(),
        }
      end)

      if not ok then
        print("FAILED to publish to NATS: " .. tostring(err))
        kumo.reject(500, "Temporary failure publishing to NATS: " .. tostring(err))
        return
      else
        print("RESULT: NATS SUCCESS")
      end

      return "250 Published to NATS"
    end

    function connection:close()
      -- NATS connection is managed globally, no-op
    end

    return connection
  end,
}

