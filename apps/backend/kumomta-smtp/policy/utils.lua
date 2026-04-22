local constants = require 'policy.constants'

local utils = {}

function utils.url_encode(str)
  if str then
    str = str:gsub("\n", "\r\n")
    str = str:gsub("([^%w %-%_%.%~])", function(c)
      return string.format("%%%02X", string.byte(c))
    end)
    str = str:gsub(" ", "+")
  end
  return str
end

function utils.inject_tracking(data, email_log_id)
  local tracking_base_url = constants.base_url:gsub("/+$", "")

  -- Only proceed if it looks like HTML
  if not data:find("text/html") then
    return data
  end

  -- 1. Inject pixel before </body>
  local pixel = string.format('<img src="%s/api/mail/v1/track/open/%s" width="1" height="1" style="display:none" alt="" />', tracking_base_url, email_log_id)
  if data:find("</body>") then
    data = data:gsub("</body>", pixel .. "</body>")
  else
    -- If no </body>, just append at end (naive but better than nothing)
    data = data .. pixel
  end

  -- 2. Rewrite links
  -- Aggressive approach for raw MIME/Quoted-Printable: href=3D"URL" or href="URL"
  data = data:gsub('(href=3D?["\']?)(https?://[^"%s >]+)(["\']?)', function(prefix, url, suffix)
    -- Skip if already tracked
    if url:find("/api/mail/v1/track/click") then
      return nil
    end
    local tracked_url = string.format("%s/api/mail/v1/track/click/%s?url=%s", tracking_base_url, email_log_id, utils.url_encode(url))
    return prefix .. tracked_url .. suffix
  end)

  return data
end

return utils
