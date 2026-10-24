package certs

import (
	"crypto/ecdsa"
	"crypto/elliptic"
	"crypto/rand"
	"crypto/x509"
	"crypto/x509/pkix"
	"encoding/base64"
	"encoding/json"
	"encoding/pem"
	"math/big"
	"os"
	"path/filepath"
	"testing"
	"time"
)

// makePEM returns a certificate/key pair for names, valid until notAfter.
func makePEM(t *testing.T, notAfter time.Time, names ...string) (certPEM, keyPEM []byte) {
	t.Helper()
	key, err := ecdsa.GenerateKey(elliptic.P256(), rand.Reader)
	if err != nil {
		t.Fatal(err)
	}
	tmpl := &x509.Certificate{
		SerialNumber: big.NewInt(time.Now().UnixNano()),
		Subject:      pkix.Name{CommonName: names[0]},
		DNSNames:     names,
		NotBefore:    time.Now().Add(-48 * time.Hour),
		NotAfter:     notAfter,
	}
	der, err := x509.CreateCertificate(rand.Reader, tmpl, tmpl, &key.PublicKey, key)
	if err != nil {
		t.Fatal(err)
	}
	keyDER, err := x509.MarshalECPrivateKey(key)
	if err != nil {
		t.Fatal(err)
	}
	return pem.EncodeToMemory(&pem.Block{Type: "CERTIFICATE", Bytes: der}),
		pem.EncodeToMemory(&pem.Block{Type: "EC PRIVATE KEY", Bytes: keyDER})
}

type acmeCert struct {
	main     string
	sans     []string
	notAfter time.Time
}

// writeAcme writes a Traefik-style acme.json with one resolver.
func writeAcme(t *testing.T, dir string, certs ...acmeCert) string {
	t.Helper()
	var list []map[string]any
	for _, c := range certs {
		names := append([]string{c.main}, c.sans...)
		certPEM, keyPEM := makePEM(t, c.notAfter, names...)
		list = append(list, map[string]any{
			"domain":      map[string]any{"main": c.main, "sans": c.sans},
			"certificate": base64.StdEncoding.EncodeToString(certPEM),
			"key":         base64.StdEncoding.EncodeToString(keyPEM),
			"Store":       "default",
		})
	}
	data, _ := json.Marshal(map[string]any{
		"letsencrypt": map[string]any{"Account": map[string]any{"Email": "x@y"}, "Certificates": list},
	})
	path := filepath.Join(dir, "acme.json")
	if err := os.WriteFile(path, data, 0o600); err != nil {
		t.Fatal(err)
	}
	return path
}

func testConfig(host string) Config {
	return Config{Hostname: host} // no default system paths in tests
}

func TestAcmeJSONExactMatch(t *testing.T) {
	dir := t.TempDir()
	cfg := testConfig("imap.reloop.sh")
	cfg.AcmeFiles = []string{writeAcme(t, dir,
		acmeCert{main: "app.reloop.sh", notAfter: time.Now().AddDate(0, 3, 0)},
		acmeCert{main: "imap.reloop.sh", notAfter: time.Now().AddDate(0, 2, 0)},
	)}
	m, err := New(cfg)
	if err != nil {
		t.Fatal(err)
	}
	if m.Source() != cfg.AcmeFiles[0] {
		t.Fatalf("source = %q, want acme.json", m.Source())
	}
	c, _ := m.GetCertificate(nil)
	if err := c.Leaf.VerifyHostname("imap.reloop.sh"); err != nil {
		t.Fatalf("wrong certificate picked: %v", err)
	}
}

func TestAcmeJSONSANAndWildcard(t *testing.T) {
	for name, entry := range map[string]acmeCert{
		"san":      {main: "reloop.sh", sans: []string{"imap.reloop.sh"}, notAfter: time.Now().AddDate(0, 2, 0)},
		"wildcard": {main: "*.reloop.sh", notAfter: time.Now().AddDate(0, 2, 0)},
	} {
		t.Run(name, func(t *testing.T) {
			cfg := testConfig("imap.reloop.sh")
			cfg.AcmeFiles = []string{writeAcme(t, t.TempDir(), entry)}
			m, err := New(cfg)
			if err != nil {
				t.Fatal(err)
			}
			if m.Source() == "self-signed" {
				t.Fatal("expected acme.json certificate")
			}
		})
	}
}

func TestAcmeJSONSkipsExpiredAndPrefersLongestLived(t *testing.T) {
	later := time.Now().AddDate(0, 3, 0).Truncate(time.Second)
	cfg := testConfig("imap.reloop.sh")
	cfg.AcmeFiles = []string{writeAcme(t, t.TempDir(),
		acmeCert{main: "imap.reloop.sh", notAfter: time.Now().Add(-time.Hour)},
		acmeCert{main: "imap.reloop.sh", notAfter: time.Now().AddDate(0, 1, 0)},
		acmeCert{main: "imap.reloop.sh", notAfter: later},
	)}
	m, err := New(cfg)
	if err != nil {
		t.Fatal(err)
	}
	c, _ := m.GetCertificate(nil)
	if !c.Leaf.NotAfter.Equal(later) {
		t.Fatalf("picked cert expiring %v, want %v", c.Leaf.NotAfter, later)
	}
}

func TestNoMatchFallsBackToSelfSigned(t *testing.T) {
	cfg := testConfig("imap.reloop.sh")
	cfg.AcmeFiles = []string{
		writeAcme(t, t.TempDir(), acmeCert{main: "other.example.com", notAfter: time.Now().AddDate(0, 2, 0)}),
		filepath.Join(t.TempDir(), "missing.json"),
	}
	m, err := New(cfg)
	if err != nil {
		t.Fatal(err)
	}
	if m.Source() != "self-signed" {
		t.Fatalf("source = %q, want self-signed", m.Source())
	}
	c, _ := m.GetCertificate(nil)
	if err := c.Leaf.VerifyHostname("imap.reloop.sh"); err != nil {
		t.Fatalf("self-signed cert has wrong name: %v", err)
	}
}

func TestExplicitFilesWinAndRefreshPicksUpRenewal(t *testing.T) {
	dir := t.TempDir()
	certFile, keyFile := filepath.Join(dir, "fullchain.pem"), filepath.Join(dir, "privkey.pem")
	write := func(notAfter time.Time) {
		c, k := makePEM(t, notAfter, "imap.reloop.sh")
		if err := os.WriteFile(certFile, c, 0o600); err != nil {
			t.Fatal(err)
		}
		if err := os.WriteFile(keyFile, k, 0o600); err != nil {
			t.Fatal(err)
		}
	}
	first := time.Now().AddDate(0, 0, 10).Truncate(time.Second)
	write(first)

	cfg := testConfig("imap.reloop.sh")
	cfg.CertFile, cfg.KeyFile = certFile, keyFile
	cfg.AcmeFiles = []string{writeAcme(t, t.TempDir(), acmeCert{main: "imap.reloop.sh", notAfter: time.Now().AddDate(1, 0, 0)})}
	m, err := New(cfg)
	if err != nil {
		t.Fatal(err)
	}
	if m.Source() != certFile {
		t.Fatalf("source = %q, explicit files should win", m.Source())
	}

	renewed := time.Now().AddDate(0, 3, 0).Truncate(time.Second)
	write(renewed)
	m.Refresh()
	c, _ := m.GetCertificate(nil)
	if !c.Leaf.NotAfter.Equal(renewed) {
		t.Fatalf("after refresh cert expires %v, want renewed %v", c.Leaf.NotAfter, renewed)
	}
}

func TestPEMFromEnvData(t *testing.T) {
	c, k := makePEM(t, time.Now().AddDate(0, 1, 0), "imap.reloop.sh")
	cfg := testConfig("imap.reloop.sh")
	cfg.CertPEM, cfg.KeyPEM = string(c), string(k)
	m, err := New(cfg)
	if err != nil {
		t.Fatal(err)
	}
	if m.Source() != "IMAP_TLS_CERT_DATA" {
		t.Fatalf("source = %q", m.Source())
	}
}

func TestMatchesAnyAndNormalizeHost(t *testing.T) {
	cases := []struct {
		names []string
		host  string
		want  bool
	}{
		{[]string{"imap.reloop.sh"}, "imap.reloop.sh", true},
		{[]string{"*.reloop.sh"}, "imap.reloop.sh", true},
		{[]string{"*.reloop.sh"}, "a.imap.reloop.sh", false},
		{[]string{"*.reloop.sh"}, "reloop.sh", false},
		{[]string{"smtp.reloop.sh"}, "imap.reloop.sh", false},
	}
	for _, c := range cases {
		if got := matchesAny(c.names, c.host); got != c.want {
			t.Errorf("matchesAny(%v, %q) = %v, want %v", c.names, c.host, got, c.want)
		}
	}
	for in, want := range map[string]string{
		"https://IMAP.reloop.sh/": "imap.reloop.sh",
		"imap.reloop.sh:993":      "imap.reloop.sh",
		" imap.reloop.sh ":        "imap.reloop.sh",
	} {
		if got := normalizeHost(in); got != want {
			t.Errorf("normalizeHost(%q) = %q, want %q", in, got, want)
		}
	}
}
