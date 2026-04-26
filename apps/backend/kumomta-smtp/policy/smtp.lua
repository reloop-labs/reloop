local kumo = require 'kumo'
local constants = require 'policy.constants'
local utils = require 'policy.utils'

-- Helper function to apply business logic to both SMTP and HTTP generated messages
local function apply_reloop_logic(msg, api_key)
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

  local client = kumo.http.build_client({
    danger_accept_invalid_certs = true,
    headers = {
      ["x-kumomta-key"] = constants.kumomta_key,
      ["Content-Type"] = "application/json"
    }
  })

  -- Check if message was already logged by internal backend HTTP inject
  local existing_log_id = msg:get_first_named_header_value('X-Email-Log-ID')

  if not existing_log_id then
    local status, response = pcall(function()
      local req = client:post(constants.kumomta_url .. "/api/kumomta/v1/log-incoming")
      return req
        :header("x-kumomta-key", constants.kumomta_key)
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
          htmlBody = html_body,
          rawMessage = data
        }))
        :send()
    end)

    if not status then
      print("FAILED: " .. tostring(response))
      kumo.reject(451, "4.3.0 Temporary failure contacting log-incoming endpoint: " .. tostring(response))
      return
    else
      print("RESULT: SUCCESS")
    end

    local code = response:status_code()
    local body_text = response:text()
    print("[LOG-INCOMING] status=" .. tostring(code) .. " body=" .. tostring(body_text))

    if code == 200 then
      -- success, store the log ID in metadata for webhook tracking
      local body = kumo.serde.json_parse(body_text)
      if body and body.id then
        msg:set_meta('X-Email-Log-ID', body.id)

        -- Apply tracking injection
        local new_data = utils.inject_tracking(msg:get_data(), body.id)
        if new_data ~= msg:get_data() then
          msg:set_data(new_data)
          print("[TRACKING] injected tracking into message " .. msg:id())
        end
      end
    elseif code == 401 then
      kumo.reject(535, "5.7.8 Invalid API key")
    elseif code == 404 then
      kumo.reject(550, "5.7.1 Domain " .. domain .. " not found")
    else
      kumo.reject(451, "4.3.0 Temporary failure verifying API key or domain status")
    end
  else
    msg:set_meta('X-Email-Log-ID', existing_log_id)
    print("[LOG-INCOMING] Skipped log-incoming, already logged with ID=" .. existing_log_id)
  end

  -- DKIM sign the message
  local dkim_ok, dkim_resp = pcall(function()
    local req = client:post(constants.kumomta_url .. "/api/kumomta/v1/dkim-key")
    return req
      :header("x-kumomta-key", constants.kumomta_key)
      :header("Content-Type", "application/json")
      :body(kumo.serde.json_encode({ key = api_key, domainName = domain }))
      :send()
  end)

  if dkim_ok then
    local dkim_code = dkim_resp:status_code()
    if dkim_code == 200 then
      local dkim_data = kumo.serde.json_parse(dkim_resp:text())
      if dkim_data and dkim_data.privateKey and dkim_data.selector then
        local sign_ok, sign_err = pcall(function()
          local signer = kumo.dkim.rsa_sha256_signer {
            domain   = domain,
            selector = dkim_data.selector,
            headers  = { 'From', 'To', 'Subject' },
            key      = { key_data = dkim_data.privateKey },
          }
          msg:dkim_sign(signer)
        end)
        if sign_ok then
          print("[DKIM] signed for domain=" .. domain .. " selector=" .. dkim_data.selector)
        else
          print("[DKIM] signing failed: " .. tostring(sign_err))
        end
      else
        print("[DKIM] key data missing in response")
      end
    else
      print("[DKIM] key fetch failed code=" .. tostring(dkim_code))
    end
  else
    print("[DKIM] key fetch error: " .. tostring(dkim_resp))
  end
end

-- AUTH
kumo.on('smtp_server_auth_plain', function(authz, authc, password, conn_meta)
  -- Store API key; actual key + domain verification happens on message receipt
  conn_meta:set_meta('api_key', password)
  conn_meta:set_meta('authz_id', authc)
  return true
end)

kumo.on('http_server_validate_auth_basic', function(user, password)
  -- Return an AuthInfo object containing the password as the identity
  -- so that http_message_generated receives the password in http_auth
  return {
    identities = {
      { identity = password, context = 'HttpBasicAuth' },
    }
  }
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
  apply_reloop_logic(msg, api_key)
end)

kumo.on('http_message_generated', function(msg)
  local http_auth = msg:get_meta('http_auth')
  local api_key = ""
  if type(http_auth) == "table" and http_auth.password then
    api_key = http_auth.password
  elseif type(http_auth) == "string" then
    api_key = http_auth
  end
  apply_reloop_logic(msg, api_key)
end)
