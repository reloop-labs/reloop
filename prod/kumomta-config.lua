local kumo = require 'kumo'

kumo.on('init', function()
  kumo.define_spool {
    name = 'data',
    path = '/var/spool/kumomta/data',
  }

  kumo.define_spool {
    name = 'meta',
    path = '/var/spool/kumomta/meta',
  }

  kumo.start_esmtp_listener {
    listen = '0.0.0.0:25',

    -- allow connection (NOT relay)
  }

  kumo.start_http_listener {
    listen = '0.0.0.0:8000',
    trusted_hosts = { '0.0.0.0/0' },
  }
end)

-- AUTH
kumo.on('smtp_server_auth_plain', function(authz, authc, password, conn_meta)
  local kumomta_key = os.getenv("X_KUMOMTA_KEY") or "reloop"
  local kumomta_endpoint = os.getenv("KUMOMTA_ENDPOINT") or "http://local.reloop.sh"

  local client = kumo.http.build_client({
    headers = {
      ["x-kumomta-key"] = kumomta_key,
      ["Content-Type"] = "application/json"
    }
  })
  local status, response = pcall(function()
    local req = client:post(kumomta_endpoint .. "/api/kumomta/v1/auth/verify")
    return req
      :header("x-kumomta-key", kumomta_key)
      :header("Content-Type", "application/json")
      :body(kumo.serde.json_encode({
        key = password
      }))
      :send()
  end)

  if not status then
    print("HTTP CALL FAILED: " .. tostring(response))
  elseif response then
    print("HTTP STATUS: " .. tostring(response:status_code()))
  end

  if status and response and response:status_code() == 200 then
    conn_meta:set_meta('authz_id', authc)
    return true
  end

  return false
end)

-- 🔥 THIS is the REAL relay control (docs way)
kumo.on('get_listener_domain', function(domain, listener, conn_meta)
  if conn_meta:get_meta('authz_id') then
    return kumo.make_listener_domain {
      relay_to = true,
    }
  end
end)

-- Enforce Domain Verification on Receipt
kumo.on('smtp_server_message_received', function(msg)
  local sender = msg:sender()
  local domain = ""
  if sender then
    domain = string.match(tostring(sender), "@([^>]+)?") or ""
  end

  if domain ~= "" then
    local kumomta_key = os.getenv("X_KUMOMTA_KEY") or "reloop"
    local kumomta_endpoint = os.getenv("KUMOMTA_ENDPOINT") or "http://local.reloop.sh"

    local client = kumo.http.build_client({
      headers = {
        ["x-kumomta-key"] = kumomta_key,
        ["Content-Type"] = "application/json"
      }
    })

    local status, response = pcall(function()
      local req = client:post(kumomta_endpoint .. "/api/kumomta/v1/domain/verify")
      return req
        :header("x-kumomta-key", kumomta_key)
        :header("Content-Type", "application/json")
        :body(kumo.serde.json_encode({
          domain = domain
        }))
        :send()
    end)

    if status and response and response:status_code() == 200 then
      local body = kumo.serde.json_parse(response:text())
      if not body.isVerified then
        kumo.reject(550, "5.7.1 Domain " .. domain .. " is not verified or active.")
      end
    else
      kumo.reject(451, "4.3.0 Temporary failure verifying domain status")
    end
  end
end)
