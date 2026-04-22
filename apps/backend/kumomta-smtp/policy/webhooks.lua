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
    local client = kumo.http.build_client {}

    function connection:send(message)
      local response = client
        :post(constants.kumomta_endpoint .. '/api/kumomta/v1/webhook/kumomta')
        :header('Content-Type', 'application/json')
        :header('x-kumomta-key', constants.kumomta_key)
        :body('[' .. message:get_data() .. ']')
        :send()

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
