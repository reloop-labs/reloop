package auth

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"sync/atomic"
	"testing"
)

const goodKey = "rl_prod_goodkey000000000000"

// fakeDomain mimics /v1/smtp-auth: goodKey may use support@acme.com only.
func fakeDomain(t *testing.T, calls *atomic.Int32) *httptest.Server {
	return httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		calls.Add(1)
		if r.URL.Path != "/api/domain/v1/smtp-auth" || r.Method != http.MethodPost {
			http.NotFound(w, r)
			return
		}
		var body struct{ Email string }
		_ = json.NewDecoder(r.Body).Decode(&body)
		if r.Header.Get("x-api-key") != goodKey || body.Email != "support@acme.com" {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}
		_ = json.NewEncoder(w).Encode(map[string]any{"ok": true, "organizationId": "org_1"})
	}))
}

func TestVerify(t *testing.T) {
	var calls atomic.Int32
	srv := fakeDomain(t, &calls)
	defer srv.Close()
	v := NewVerifier(srv.URL + "/api/domain/")
	ctx := context.Background()

	org, ok, err := v.Verify(ctx, goodKey, " Support@ACME.com ")
	if err != nil || !ok || org != "org_1" {
		t.Fatalf("good key: org=%q ok=%v err=%v", org, ok, err)
	}

	if _, ok, err := v.Verify(ctx, goodKey, "sales@acme.com"); ok || err != nil {
		t.Fatalf("out-of-scope address must be refused: ok=%v err=%v", ok, err)
	}
	if _, ok, err := v.Verify(ctx, "rl_prod_wrong", "support@acme.com"); ok || err != nil {
		t.Fatalf("wrong key must be refused: ok=%v err=%v", ok, err)
	}

	// Successful logins are cached briefly.
	before := calls.Load()
	if _, ok, _ := v.Verify(ctx, goodKey, "support@acme.com"); !ok {
		t.Fatal("cached login failed")
	}
	if calls.Load() != before {
		t.Fatal("expected cache hit, got a request")
	}
}

func TestVerifyRejectsWithoutCalling(t *testing.T) {
	var calls atomic.Int32
	srv := fakeDomain(t, &calls)
	defer srv.Close()
	v := NewVerifier(srv.URL + "/api/domain")

	long := make([]byte, maxKeyLength+1)
	for i := range long {
		long[i] = 'a'
	}
	for _, c := range []struct{ key, email string }{{"", "a@b.c"}, {goodKey, ""}, {string(long), "a@b.c"}} {
		if _, ok, err := v.Verify(context.Background(), c.key, c.email); ok || err != nil {
			t.Fatalf("expected plain refusal for %q/%q", c.key, c.email)
		}
	}
	if calls.Load() != 0 {
		t.Fatalf("made %d requests for inputs that should be rejected locally", calls.Load())
	}
}

func TestVerifyUnavailable(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusBadGateway)
	}))
	v := NewVerifier(srv.URL)
	if _, ok, err := v.Verify(context.Background(), goodKey, "support@acme.com"); ok || !errors.Is(err, ErrUnavailable) {
		t.Fatalf("5xx must be ErrUnavailable: ok=%v err=%v", ok, err)
	}
	srv.Close()
	if _, ok, err := v.Verify(context.Background(), goodKey, "support@acme.com"); ok || !errors.Is(err, ErrUnavailable) {
		t.Fatalf("connection error must be ErrUnavailable: ok=%v err=%v", ok, err)
	}
}
