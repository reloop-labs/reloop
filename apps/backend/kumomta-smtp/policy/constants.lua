local constants = {}

constants.kumomta_key = os.getenv("X_KUMOMTA_KEY") or "reloop"
constants.base_url = os.getenv("BASE_URL") or "https://local.reloop.sh"
constants.kumomta_url = os.getenv("KUMOMTA_WEBHOOK_URL") or  "http://host.docker.internal:8021"

return constants
