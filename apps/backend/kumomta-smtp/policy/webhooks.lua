local kumo = require 'kumo'
local log_hooks = require 'policy-extras.log_hooks'
local constants = require 'policy.constants'

log_hooks:new {
  name = 'webhook',
  log_parameters = {
    headers = { 'Subject', 'X-Email-Log-ID' },
    meta = { 'X-Email-Log-ID' },
  },
  constructor = function(domain, tenant, campaign)
    local connection = {}
    local client = kumo.http.build_client {
      danger_accept_invalid_certs = true,
    }

    function connection:send(message)
      local ok, response = pcall(function()
        return client
          :post(constants.kumomta_url .. '/api/kumomta/v1/webhook/kumomta')
          :header('Content-Type', 'application/json')
          :header('x-kumomta-key', constants.kumomta_key)
          :body('[' .. message:get_data() .. ']')
          :send()
      end)

      if not ok then
        print("FAILED: " .. tostring(response))
        kumo.reject(500, "Temporary failure contacting webhook endpoint: " .. tostring(response))
        return
      else
        print("RESULT: SUCCESS")
      end

      local disposition = string.format(
        '%d %s: %s',
        response:status_code(),
        response:status_reason(),
        response:text()
      )

      if response:status_is_success() then
        return disposition
      end
      kumo.reject(500, disposition)
    end

    function connection:close()
      client:close()
    end

    return connection
  end,
}
