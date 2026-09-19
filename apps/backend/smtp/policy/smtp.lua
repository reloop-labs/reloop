local kumo = require 'kumo'
local constants = require 'policy.constants'
local utils = require 'policy.utils'
utils.init(kumo)



local function bare_email(addr)
  local s = tostring(addr or "")
  s = s:gsub("^%s+", ""):gsub("%s+$", "")
  local angled = s:match("<([^<>]+)>")
  if angled then
    s = angled
  end
  s = s:gsub("^%s+", ""):gsub("%s+$", "")
  local email = s:match("([^%s<>]+@[^%s<>]+)")
  if not email then
    return ""
  end
  return string.lower(email)
end

local function envelope_email(recip)
  if type(recip) == "table" then
    local user = recip.user or recip.local_part
    local recip_domain = recip.domain
    if user and recip_domain and tostring(user) ~= "" and tostring(recip_domain) ~= "" then
      return string.lower(tostring(user) .. "@" .. tostring(recip_domain))
    end
  end
  return bare_email(recip)
end

local function add_unique(emails, seen, email)
  if email == nil or email == "" or seen[email] then
    return
  end
  seen[email] = true
  table.insert(emails, email)
end

-- Charge quota for envelope RCPT TO, not the visible To header.
local function collect_send_recipients(msg)
  local seen = {}
  local emails = {}

  local ok_list, list = pcall(function()
    return msg:recipient_list()
  end)
  if ok_list and type(list) == "table" then
    for _, recip in ipairs(list) do
      add_unique(emails, seen, envelope_email(recip))
    end
  end

  if #emails == 0 then
    local ok_one, one = pcall(function()
      return msg:recipient()
    end)
    if ok_one and one then
      add_unique(emails, seen, envelope_email(one))
    end
  end

  if #emails == 0 then
    for _, header_name in ipairs({ "To", "Cc", "Bcc" }) do
      local header = msg:get_first_named_header_value(header_name)
      if header and header ~= "" then
        for part in string.gmatch(header, "[^,;]+") do
          add_unique(emails, seen, bare_email(part))
        end
      end
    end
  end

  return emails
end

-- source is 'smtp' (customer submission) or 'http' (mail-service inject).
local function apply_reloop_logic(msg, api_key, source)
  local msg_id = msg:id()

  local header_api_key = msg:get_first_named_header_value('X-Api-Key')
  if header_api_key and header_api_key ~= "" then
    api_key = header_api_key
    print("[LOG-INCOMING] [" .. msg_id .. "] Found X-Api-Key header: using it as api_key")
  end
  msg:remove_all_named_headers('X-Api-Key')
  local header_tls_mode = msg:get_first_named_header_value('X-Reloop-TLS-Mode')
  msg:remove_all_named_headers('X-Reloop-TLS-Mode')
  local sender = msg:sender()
  local domain = ""
  local from_email = ""
  if sender then
    from_email = tostring(sender)
    domain = string.match(from_email, "@([^>]+)>?") or ""
  end

  local header_from = bare_email(msg:get_first_named_header_value('From'))
  local header_from_domain = string.match(header_from, "@(.+)$") or ""
  if header_from_domain ~= "" and header_from_domain ~= string.lower(domain) then
    print("[LOG-INCOMING] [" .. msg_id .. "] REJECTED: From header domain " .. header_from_domain .. " does not match sender domain " .. domain)
    kumo.reject(550, "5.7.1 From header domain must match the authenticated sender domain")
    return
  end

  local to_emails = collect_send_recipients(msg)
  if #to_emails == 0 then
    print("[LOG-INCOMING] [" .. msg_id .. "] REJECTED: No envelope recipients")
    kumo.reject(550, "5.7.1 No envelope recipients")
    return
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

  print("[LOG-INCOMING] [" .. msg_id .. "] processing message: domain=" .. domain .. " recipients=" .. #to_emails)

  local existing_log_id = msg:get_first_named_header_value('X-Email-Log-ID')
  local org_id = msg:get_first_named_header_value('X-Org-ID') or ""
  local is_internal = (api_key ~= "" and api_key == constants.internal_secret)
  -- Mail HTTP inject already inserted email_log (API key or internal secret).
  -- Customer SMTP must not skip quota by stamping a fake X-Email-Log-ID.
  local trust_log_id = is_internal or source == 'http'

  if not trust_log_id then
    if existing_log_id and existing_log_id ~= "" then
      print("[LOG-INCOMING] [" .. msg_id .. "] Ignoring customer X-Email-Log-ID")
    end
    existing_log_id = nil
  end
  -- Never leak Reloop log ids to mailbox providers.
  msg:remove_all_named_headers('X-Email-Log-ID')

  if is_internal and (not existing_log_id or existing_log_id == "") then
    print("[LOG-INCOMING] [" .. msg_id .. "] REJECTED: Internal secret requires X-Email-Log-ID (mail service inject only)")
    kumo.reject(550, "5.7.1 Authentication required")
    return
  end

  if is_internal and (org_id == "") then
    print("[LOG-INCOMING] [" .. msg_id .. "] REJECTED: Internal secret requires X-Org-ID")
    kumo.reject(550, "5.7.1 Missing organization context")
    return
  end

  if api_key == "" or domain == "" then
    print("[LOG-INCOMING] [" .. msg_id .. "] REJECTED: Missing credentials or sender domain")
    kumo.reject(550, "5.7.1 Missing credentials or sender domain.")
    return
  end

  local client = kumo.http.build_client({
    danger_accept_invalid_certs = true
  })

  -- Mail HTTP inject already created email_log; SMTP still needs log-incoming.
  if not existing_log_id then
    local target_url = constants.kumomta_url .. "/v1/log-incoming"
    print("[LOG-INCOMING] [" .. msg_id .. "] calling webhook: " .. target_url)

    local status, response = pcall(function()
      local payload = {
        domainName = domain,
        messageId = message_id,
        providerMessageId = msg_id,
        fromEmail = from_email,
        toEmails = to_emails,
        subject = subject,
        size = size,
        textBody = text_body,
        htmlBody = html_body,
        rawMessage = data
      }
      local payload_str = kumo.serde.json_encode(payload)
      print("[LOG-INCOMING PAYLOAD] [" .. msg_id .. "] " .. payload_str)

      local req = client:post(target_url)
      return req
        :header("x-api-key", api_key)
        :header("Content-Type", "application/json")
        :header("User-Agent", "ReloopSmtp/1.0")
        :body(payload_str)
        :send()
    end)

    if not status then
      print("[LOG-INCOMING] [" .. msg_id .. "] FAILED to send request: " .. tostring(response))
      kumo.reject(451, "4.3.0 Temporary failure contacting log-incoming endpoint: " .. tostring(response))
      return
    end

    local code = response:status_code()
    local body_text = response:text()
    print("[LOG-INCOMING] [" .. msg_id .. "] response: status=" .. tostring(code) .. " body=" .. tostring(body_text))

    if code == 200 then
      -- success, store the log ID in metadata for webhook tracking
      local body = kumo.serde.json_parse(body_text)
      if body and body.id then
        msg:set_meta('X-Email-Log-ID', body.id)
        print("[LOG-INCOMING] [" .. msg_id .. "] stored log ID: " .. body.id)

        -- Apply tracking injection
        local new_data = utils.inject_tracking(
          msg:get_data(),
          body.id,
          body.trackingDomain,
          body.clickTracking,
          body.openTracking
        )
        if new_data ~= msg:get_data() then
          msg:set_data(new_data)
          print("[TRACKING] [" .. msg_id .. "] injected tracking into message (domain: " .. tostring(body.trackingDomain) .. ")")
        end
        utils.apply_tls_mode(msg, body.tls or header_tls_mode)
      else
        print("[LOG-INCOMING] [" .. msg_id .. "] ERROR: backend returned 200 but no ID found")
        utils.apply_tls_mode(msg, header_tls_mode)
      end
    elseif code == 400 then
      print("[LOG-INCOMING] [" .. msg_id .. "] REJECTED: Invalid recipients")
      kumo.reject(550, "5.7.1 Invalid recipients")
      return
    elseif code == 401 then
      print("[LOG-INCOMING] [" .. msg_id .. "] REJECTED: Invalid API key")
      kumo.reject(535, "5.7.8 Invalid API key")
      return
    elseif code == 402 then
      print("[LOG-INCOMING] [" .. msg_id .. "] REJECTED: Email quota exceeded")
      kumo.reject(550, "5.7.1 Email quota exceeded")
      return
    elseif code == 403 then
      print("[LOG-INCOMING] [" .. msg_id .. "] REJECTED: Abuse policy")
      kumo.reject(550, "5.7.1 Message rejected")
      return
    elseif code == 404 then
      print("[LOG-INCOMING] [" .. msg_id .. "] REJECTED: Domain " .. domain .. " not found")
      kumo.reject(550, "5.7.1 Domain " .. domain .. " not found")
      return
    elseif code == 409 then
      print("[LOG-INCOMING] [" .. msg_id .. "] REJECTED: Message ID already exists")
      kumo.reject(550, "5.7.1 Message ID already exists")
      return
    else
      print("[LOG-INCOMING] [" .. msg_id .. "] ERROR: Unhandled status code " .. tostring(code))
      kumo.reject(451, "4.3.0 Temporary failure verifying API key or domain status")
      return
    end
  else
    msg:set_meta('X-Email-Log-ID', existing_log_id)
    print("[LOG-INCOMING] [" .. msg_id .. "] Skipped log-incoming, already logged with ID=" .. existing_log_id)
    utils.apply_tls_mode(msg, header_tls_mode)
  end

  -- Ensure mandatory headers for deliverability
  if not msg:get_first_named_header_value('Date') then
    local date_str = os.date("!%a, %d %b %Y %H:%M:%S +0000")
    msg:append_header('Date', date_str)
    print("[HEADERS] [" .. msg_id .. "] Injected missing Date: " .. date_str)
  end

  if not msg:get_first_named_header_value('MIME-Version') then
    msg:append_header('MIME-Version', '1.0')
    print("[HEADERS] [" .. msg_id .. "] Injected missing MIME-Version: 1.0")
  end

  local current_mid = msg:get_first_named_header_value('Message-ID')
  if not current_mid or not current_mid:find("^<.+@.+>$") then
    local new_mid = string.format("<%s@%s>", msg_id, domain)
    msg:append_header('Message-ID', new_mid)
    print("[HEADERS] [" .. msg_id .. "] Injected/Fixed Message-ID: " .. new_mid)
  end

  -- DKIM sign the message (MUST BE LAST AFTER ALL HEADER/BODY CHANGES)
  local dkim_target = constants.kumomta_url .. "/v1/dkim-key"
  print("[DKIM] [" .. msg_id .. "] fetching key from: " .. dkim_target)

  local dkim_ok, dkim_resp = pcall(function()
    local req = client:post(dkim_target)
    req = req
      :header("Content-Type", "application/json")
      :header("User-Agent", "ReloopSmtp/1.0")
    if is_internal then
      -- Internal auth requires x-user-id + x-organization-id (service principal).
      req = req
        :header("x-internal-secret", constants.internal_secret)
        :header("x-organization-id", org_id)
        :header("x-user-id", "system")
    else
      req = req:header("x-api-key", api_key)
    end
    return req
      :body(kumo.serde.json_encode({ domainName = domain }))
      :send()
  end)

  if dkim_ok then
    local dkim_code = dkim_resp:status_code()
    local dkim_body = dkim_resp:text()
    if dkim_code == 200 then
      local dkim_data = kumo.serde.json_parse(dkim_body)
      if dkim_data and dkim_data.privateKey and dkim_data.selector then
        local sign_ok, sign_err = pcall(function()
          -- RFC 6376 5.4.1 plus List-Unsubscribe-Post (RFC 8058). Gmail will
          -- not offer one-click unsubscribe unless those two list headers are
          -- in the DKIM h= tag.
          local signer = kumo.dkim.rsa_sha256_signer {
            domain   = domain,
            selector = dkim_data.selector,
            headers  = {
              'From', 'Sender', 'Reply-To', 'Subject', 'Date', 'Message-ID',
              'To', 'Cc', 'MIME-Version', 'Content-Type',
              'Content-Transfer-Encoding', 'Resent-Date', 'Resent-From',
              'Resent-To', 'Resent-Cc', 'In-Reply-To', 'References',
              'List-Id', 'List-Help', 'List-Unsubscribe',
              'List-Unsubscribe-Post', 'List-Subscribe', 'List-Post',
              'List-Owner', 'List-Archive',
            },
            key      = { key_data = dkim_data.privateKey },
          }
          msg:dkim_sign(signer)
        end)
        if sign_ok then
          print("[DKIM] [" .. msg_id .. "] signed successfully: selector=" .. dkim_data.selector)
        else
          print("[DKIM] [" .. msg_id .. "] signing failed: " .. tostring(sign_err))
        end
      else
        print("[DKIM] [" .. msg_id .. "] ERROR: key data missing in response")
      end
    else
      print("[DKIM] [" .. msg_id .. "] fetch failed: status=" .. tostring(dkim_code))
    end
  else
    print("[DKIM] [" .. msg_id .. "] fetch error (pcall failed): " .. tostring(dkim_resp))
  end

  -- Persist final on-the-wire MIME (after tracking + headers + DKIM) for the detail Raw tab.
  local log_id = msg:get_meta('X-Email-Log-ID') or existing_log_id
  if log_id and log_id ~= "" then
    local store_url = constants.kumomta_url .. "/v1/store-raw"
    local final_raw = msg:get_data()
    local store_ok, store_resp = pcall(function()
      local req = client:post(store_url)
      req = req
        :header("Content-Type", "application/json")
        :header("User-Agent", "ReloopSmtp/1.0")
      if is_internal then
        -- Internal auth requires x-user-id + x-organization-id (service principal).
        req = req
          :header("x-internal-secret", constants.internal_secret)
          :header("x-organization-id", org_id)
          :header("x-user-id", "system")
      else
        req = req:header("x-api-key", api_key)
      end
      return req
        :body(kumo.serde.json_encode({
          emailLogId = log_id,
          rawMessage = final_raw,
        }))
        :send()
    end)
    if store_ok then
      local store_code = store_resp:status_code()
      if store_code == 200 then
        print("[STORE-RAW] [" .. msg_id .. "] saved raw for " .. tostring(log_id) .. " (" .. tostring(#final_raw) .. " bytes)")
      else
        print("[STORE-RAW] [" .. msg_id .. "] failed status=" .. tostring(store_code) .. " body=" .. tostring(store_resp:text()))
      end
    else
      print("[STORE-RAW] [" .. msg_id .. "] request error: " .. tostring(store_resp))
    end
  end
end

local function validate_smtp_api_key(password)
  if password == nil or password == "" then
    return false, "empty"
  end

  local client = kumo.http.build_client({
    danger_accept_invalid_certs = true
  })
  local target_url = constants.kumomta_url .. "/v1/smtp-auth"
  local status, response = pcall(function()
    local req = client:post(target_url)
    return req
      :header("x-api-key", password)
      :header("User-Agent", "ReloopSmtp/1.0")
      :send()
  end)

  if not status then
    return nil, tostring(response)
  end

  local code = response:status_code()
  if code == 200 then
    return true
  end
  if code == 401 then
    return false, "unauthorized"
  end
  return nil, "status " .. tostring(code)
end

-- AUTH: reject unknown passwords at connect time, not only at DATA.
kumo.on('smtp_server_auth_plain', function(authz, authc, password, conn_meta)
  local ok, err = validate_smtp_api_key(password)
  if ok == true then
    conn_meta:set_meta('api_key', password)
    conn_meta:set_meta('authz_id', authc)
    print("[SMTP-AUTH] accepted")
    return true
  end
  if ok == false then
    print("[SMTP-AUTH] rejected: " .. tostring(err))
    return false
  end
  print("[SMTP-AUTH] temporary failure: " .. tostring(err))
  kumo.reject(454, "4.7.0 Temporary authentication failure")
  return false
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

-- Relay control: only authenticated senders can relay
kumo.on('get_listener_domain', function(domain, listener, conn_meta)
  if conn_meta:get_meta('authz_id') then
    return kumo.make_listener_domain {
      relay_to = true,
    }
  end

  -- Reject unauthenticated senders — inbound mail is handled by the
  -- dedicated inbound MTA service, not this outbound relay.
  return kumo.make_listener_domain {
    relay_to = false,
  }
end)



-- Outbound: API Key + Domain Verification on Receipt
kumo.on('smtp_server_message_received', function(msg)
  local api_key = msg:get_meta('api_key') or ""

  if api_key == "" then
    print("[SMTP] [" .. msg:id() .. "] Rejected: no API key (unauthenticated)")
    kumo.reject(550, "5.7.1 Authentication required")
    return
  end

  apply_reloop_logic(msg, api_key, 'smtp')
end)

kumo.on('http_message_generated', function(msg)
  local http_auth = msg:get_meta('http_auth')
  local api_key = ""
  if type(http_auth) == "table" and http_auth.password then
    api_key = http_auth.password
  elseif type(http_auth) == "string" and http_auth ~= "" then
    -- Identity is the Basic-auth password: org API key (rl_...) or internal secret
    api_key = http_auth
  end
  apply_reloop_logic(msg, api_key, 'http')
end)
