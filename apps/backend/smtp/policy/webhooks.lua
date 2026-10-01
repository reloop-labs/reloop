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
      -- Drop pre-queue rejections at source: kumo.reject() in smtp.lua
      -- (409 duplicate, bad auth, undeliverable domain, quota, abuse)
      -- never got an X-Email-Log-ID, so the logs worker can only warn
      -- "missing X-Email-Log-ID ... skipping". Skipping here saves NATS
      -- traffic and SigNoz warn spam. Delivery-state types always publish.
      local ok_parse, record = pcall(function()
        return kumo.serde.json_parse(message:get_data())
      end)
      if ok_parse and type(record) == "table" and record.type == "Rejection" then
        return "250 Skipped (Rejection)"
      end

      local nc = get_nats_client()
      local ok, err = pcall(function()
        nc:publish {
          subject = 'kumomta.event',
          payload = message:get_data(),
        }
      end)

      if not ok then
        print("FAILED to publish to NATS: " .. tostring(err))
        nats_client = nil
        return "250 Accepted (NATS publish failed)"
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

