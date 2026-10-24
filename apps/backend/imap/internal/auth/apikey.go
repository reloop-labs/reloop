// Package auth checks IMAP logins: the password is a Reloop API key, validated
// (with its address scope) by the domain service — the same /v1/smtp-auth
// check KumoMTA uses for SMTP AUTH, so both protocols follow one rule.
package auth

import (
	"bytes"
	"context"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strings"
	"sync"
	"time"
)

// Matches packages/auth/src/apikey/helpers.ts (API_KEY_MAX_LENGTH).
const maxKeyLength = 128

// ErrUnavailable means the key could not be checked (domain service down);
// callers should report a temporary failure, not bad credentials.
var ErrUnavailable = errors.New("auth service unavailable")

type Verifier struct {
	url            string
	internalSecret string
	client         *http.Client
	ttl            time.Duration

	mu    sync.Mutex
	cache map[string]cacheEntry
}

type cacheEntry struct {
	organizationID string
	expires        time.Time
}

// NewVerifier takes the domain service base URL (e.g. https://app.reloop.sh/api/domain)
// and the shared internal secret, sent as x-internal-secret like the SMTP service does.
func NewVerifier(domainServiceURL, internalSecret string) *Verifier {
	return &Verifier{
		url:            strings.TrimRight(domainServiceURL, "/") + "/v1/smtp-auth",
		internalSecret: internalSecret,
		client:         &http.Client{Timeout: 10 * time.Second},
		// Short, so a revoked or re-scoped key stops working within a minute.
		ttl:   time.Minute,
		cache: make(map[string]cacheEntry),
	}
}

// Verify reports the organization of apiKey when the key is live and its scope
// allows email. ok=false means bad credentials.
func (v *Verifier) Verify(ctx context.Context, apiKey, email string) (organizationID string, ok bool, err error) {
	apiKey = strings.TrimSpace(apiKey)
	email = strings.ToLower(strings.TrimSpace(email))
	if apiKey == "" || len(apiKey) > maxKeyLength || email == "" {
		return "", false, nil
	}

	sum := sha256.Sum256([]byte(email + "\x00" + apiKey))
	cacheKey := hex.EncodeToString(sum[:])
	v.mu.Lock()
	if e, hit := v.cache[cacheKey]; hit && time.Now().Before(e.expires) {
		v.mu.Unlock()
		return e.organizationID, true, nil
	}
	v.mu.Unlock()

	body, _ := json.Marshal(map[string]string{"email": email})
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, v.url, bytes.NewReader(body))
	if err != nil {
		return "", false, err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("x-api-key", apiKey)
	req.Header.Set("User-Agent", "ReloopImap/1.0")
	if v.internalSecret != "" {
		req.Header.Set("x-internal-secret", v.internalSecret)
	}

	resp, err := v.client.Do(req)
	if err != nil {
		return "", false, fmt.Errorf("%w: %v", ErrUnavailable, err)
	}
	defer resp.Body.Close()

	switch resp.StatusCode {
	case http.StatusOK:
		var out struct {
			OK             bool   `json:"ok"`
			OrganizationID string `json:"organizationId"`
		}
		if err := json.NewDecoder(resp.Body).Decode(&out); err != nil || !out.OK || out.OrganizationID == "" {
			return "", false, fmt.Errorf("%w: unexpected smtp-auth response", ErrUnavailable)
		}
		v.mu.Lock()
		v.cache[cacheKey] = cacheEntry{organizationID: out.OrganizationID, expires: time.Now().Add(v.ttl)}
		v.pruneLocked()
		v.mu.Unlock()
		return out.OrganizationID, true, nil
	case http.StatusUnauthorized, http.StatusForbidden:
		return "", false, nil
	default:
		return "", false, fmt.Errorf("%w: smtp-auth returned %d", ErrUnavailable, resp.StatusCode)
	}
}

// pruneLocked drops expired entries once the cache grows. Caller holds v.mu.
func (v *Verifier) pruneLocked() {
	if len(v.cache) < 1024 {
		return
	}
	now := time.Now()
	for k, e := range v.cache {
		if now.After(e.expires) {
			delete(v.cache, k)
		}
	}
}
