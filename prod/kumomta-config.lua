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
  -- Store API key; actual key + domain verification happens on message receipt
  conn_meta:set_meta('api_key', password)
  conn_meta:set_meta('authz_id', authc)
  return true
end)

-- 🔥 THIS is the REAL relay control (docs way)
kumo.on('get_listener_domain', function(domain, listener, conn_meta)
  if conn_meta:get_meta('authz_id') then
    return kumo.make_listener_domain {
      relay_to = true,
    }
  end
end)

-- Enforce API Key + Domain Verification on Receipt
kumo.on('smtp_server_message_received', function(msg)
  local api_key = msg:get_meta('api_key') or ""

  local sender = msg:sender()
  local domain = ""
  local from_email = ""
  if sender then
    from_email = tostring(sender)
    domain = string.match(from_email, "@([^>]+)>?") or ""
  end

  local to_emails = {}
  local to_header = msg:get_first_named_header_value('To')
  if to_header then
    table.insert(to_emails, tostring(to_header))
  end

  local message_id = msg:get_first_named_header_value('Message-ID') or ""
  local subject = msg:get_first_named_header_value('Subject') or ""
  local data = msg:get_data()
  local size = #data
  local text_body = ""
  local html_body = ""

  -- Simple body extraction (after headers)
  local _, body_start = string.find(data, "\r?\n\r?\n")
  if body_start then
    text_body = string.sub(data, body_start + 1)
  else
    text_body = data
  end

  print("[LOG-INCOMING] api_key=" .. api_key .. " domain=" .. domain)

  if api_key == "" or domain == "" then
    kumo.reject(550, "5.7.1 Missing credentials or sender domain.")
    return
  end

  local kumomta_key = os.getenv("X_KUMOMTA_KEY") or "reloop"
  local kumomta_endpoint = os.getenv("KUMOMTA_ENDPOINT") or "http://local.reloop.sh"

  local client = kumo.http.build_client({
    headers = {
      ["x-kumomta-key"] = kumomta_key,
      ["Content-Type"] = "application/json"
    }
  })

  local status, response = pcall(function()
    local req = client:post(kumomta_endpoint .. "/api/kumomta/v1/log-incoming")
    return req
      :header("x-kumomta-key", kumomta_key)
      :header("Content-Type", "application/json")
      :body(kumo.serde.json_encode({
        key = api_key,
        domainName = domain,
        messageId = message_id,
        providerMessageId = msg:id(),
        fromEmail = from_email,
        toEmails = to_emails,
        subject = subject,
        size = size,
        textBody = text_body,
        htmlBody = html_body
      }))
      :send()
  end)

  if not status then
    print("[LOG-INCOMING] pcall failed: " .. tostring(response))
    kumo.reject(451, "4.3.0 Temporary failure contacting log-incoming endpoint")
    return
  end

  local code = response:status_code()
  local body_text = response:text()
  print("[LOG-INCOMING] status=" .. tostring(code) .. " body=" .. tostring(body_text))

  if code == 200 then
    print("[LOG-INCOMING] tracking successful")
  elseif code == 401 then
    kumo.reject(535, "5.7.8 Invalid API key")
  elseif code == 404 then
    kumo.reject(550, "5.7.1 Domain " .. domain .. " not found")
  else
    kumo.reject(451, "4.3.0 Temporary failure verifying API key or domain status")
  end
end)
