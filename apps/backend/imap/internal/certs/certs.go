// Package certs finds a TLS certificate for the IMAP hostname automatically,
// in the same order as the SMTP service (apps/backend/smtp/entrypoint.sh):
//
//  1. IMAP_TLS_CERT / IMAP_TLS_KEY files, or IMAP_TLS_CERT_DATA / IMAP_TLS_KEY_DATA PEM
//  2. /certs/fullchain.pem + privkey.pem, /etc/letsencrypt/live/<host>/
//  3. Coolify/Traefik acme.json (certificate for <host>, or a wildcard covering it)
//  4. Caddy's certificate store
//  5. AUTO_LETSENCRYPT=true: request one from Let's Encrypt (HTTP-01 on port 80)
//  6. otherwise a self-signed certificate, with a warning
//
// Sources 1–4 are re-checked every few minutes, so renewals done by
// Traefik/Caddy/certbot are picked up without a restart.
package certs

import (
	"bytes"
	"crypto/ecdsa"
	"crypto/elliptic"
	"crypto/rand"
	"crypto/tls"
	"crypto/x509"
	"crypto/x509/pkix"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"io/fs"
	"log/slog"
	"math/big"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"time"

	"golang.org/x/crypto/acme/autocert"
)

type Config struct {
	Hostname string

	CertFile, KeyFile string // explicit paths
	CertPEM, KeyPEM   string // explicit PEM contents

	AcmeFiles  []string // Traefik acme.json candidates
	FilePairs  [][2]string
	CaddyRoots []string

	AutoLetsEncrypt bool
	Email           string
	CacheDir        string
	HTTPAddr        string // HTTP-01 challenge listener
}

// ConfigFromEnv reads the same variables the SMTP service understands, with IMAP_ prefixes.
func ConfigFromEnv() Config {
	host := normalizeHost(firstNonEmpty(os.Getenv("IMAP_HOSTNAME"), "imap.reloop.sh"))
	acmeFiles := []string{
		"/traefik/acme.json",
		"/traefik/traefik/acme.json",
		"/data/coolify/proxy/acme.json",
		"/data/coolify/proxy/traefik/acme.json",
		"/certs/acme.json",
	}
	if p := os.Getenv("IMAP_TLS_ACME_JSON"); p != "" {
		acmeFiles = append([]string{p}, acmeFiles...)
	}
	return Config{
		Hostname: host,
		CertFile: os.Getenv("IMAP_TLS_CERT"),
		KeyFile:  os.Getenv("IMAP_TLS_KEY"),
		CertPEM:  os.Getenv("IMAP_TLS_CERT_DATA"),
		KeyPEM:   os.Getenv("IMAP_TLS_KEY_DATA"),
		FilePairs: [][2]string{
			{"/certs/fullchain.pem", "/certs/privkey.pem"},
			{"/etc/letsencrypt/live/" + host + "/fullchain.pem", "/etc/letsencrypt/live/" + host + "/privkey.pem"},
		},
		AcmeFiles: acmeFiles,
		CaddyRoots: []string{
			"/traefik/caddy/certificates/acme-v02.api.letsencrypt.org-directory",
			"/data/coolify/proxy/caddy/certificates/acme-v02.api.letsencrypt.org-directory",
			"/data/coolify/proxy/caddy/data/caddy/certificates/acme-v02.api.letsencrypt.org-directory",
		},
		AutoLetsEncrypt: os.Getenv("AUTO_LETSENCRYPT") == "true",
		Email:           firstNonEmpty(os.Getenv("LETSENCRYPT_EMAIL"), "admin@"+host),
		CacheDir:        firstNonEmpty(os.Getenv("LETSENCRYPT_CACHE_DIR"), "/var/lib/imap/autocert"),
		HTTPAddr:        firstNonEmpty(os.Getenv("LETSENCRYPT_HTTP_ADDR"), ":80"),
	}
}

// Manager serves the current certificate and swaps in renewed ones.
type Manager struct {
	cfg    Config
	mu     sync.RWMutex
	cert   *tls.Certificate
	source string
	auto   *autocert.Manager
}

// New finds a certificate (falling back to self-signed) and returns a Manager.
func New(cfg Config) (*Manager, error) {
	m := &Manager{cfg: cfg}
	cert, source, notes := m.discover()
	if cert != nil {
		m.set(cert, source)
		return m, nil
	}
	slog.Warn("tls: no certificate for hostname in any source", "host", cfg.Hostname, "checked", notes)

	if cfg.AutoLetsEncrypt && cfg.Hostname != "localhost" && cfg.Hostname != "local.reloop.sh" {
		m.auto = &autocert.Manager{
			Prompt:     autocert.AcceptTOS,
			Email:      cfg.Email,
			HostPolicy: autocert.HostWhitelist(cfg.Hostname),
			Cache:      autocert.DirCache(cfg.CacheDir),
		}
		go func() {
			if err := http.ListenAndServe(cfg.HTTPAddr, m.auto.HTTPHandler(nil)); err != nil {
				slog.Error("tls: Let's Encrypt HTTP-01 listener failed", "addr", cfg.HTTPAddr, "err", err)
			}
		}()
		cert, err := m.auto.GetCertificate(&tls.ClientHelloInfo{ServerName: cfg.Hostname})
		if err == nil {
			m.set(cert, "letsencrypt")
			return m, nil
		}
		slog.Error("tls: Let's Encrypt request failed", "host", cfg.Hostname, "err", err)
	}

	cert, err := selfSigned(cfg.Hostname)
	if err != nil {
		return nil, err
	}
	slog.Warn("tls: no certificate found for hostname; using self-signed (mail apps will warn)", "host", cfg.Hostname)
	m.set(cert, "self-signed")
	return m, nil
}

// TLSConfig returns a config that always serves the latest certificate.
func (m *Manager) TLSConfig() *tls.Config {
	return &tls.Config{MinVersion: tls.VersionTLS12, GetCertificate: m.GetCertificate}
}

func (m *Manager) GetCertificate(hello *tls.ClientHelloInfo) (*tls.Certificate, error) {
	m.mu.RLock()
	source := m.source
	cert := m.cert
	m.mu.RUnlock()
	if source == "letsencrypt" && m.auto != nil {
		if hello.ServerName == "" {
			hello.ServerName = m.cfg.Hostname
		}
		if c, err := m.auto.GetCertificate(hello); err == nil {
			return c, nil
		}
	}
	return cert, nil
}

// Source names where the current certificate came from.
func (m *Manager) Source() string {
	m.mu.RLock()
	defer m.mu.RUnlock()
	return m.source
}

// Watch re-runs discovery every interval and swaps in a newer certificate.
func (m *Manager) Watch(interval time.Duration, stop <-chan struct{}) {
	t := time.NewTicker(interval)
	defer t.Stop()
	for {
		select {
		case <-stop:
			return
		case <-t.C:
			m.Refresh()
		}
	}
}

// Refresh swaps in a newly discovered certificate if it differs from the current one.
func (m *Manager) Refresh() {
	if m.Source() == "letsencrypt" {
		return // autocert renews on its own
	}
	cert, source, _ := m.discover()
	if cert == nil {
		return
	}
	m.mu.RLock()
	same := m.cert != nil && bytes.Equal(m.cert.Certificate[0], cert.Certificate[0])
	m.mu.RUnlock()
	if !same {
		m.set(cert, source)
	}
}

func (m *Manager) set(cert *tls.Certificate, source string) {
	m.mu.Lock()
	m.cert, m.source = cert, source
	m.mu.Unlock()
	if cert.Leaf != nil {
		slog.Info("tls: certificate loaded", "source", source, "subject", cert.Leaf.Subject.CommonName,
			"dns", cert.Leaf.DNSNames, "expires", cert.Leaf.NotAfter.Format(time.RFC3339))
	}
}

// discover walks sources 1–4 and returns the first usable certificate. notes
// says what was found at each location, for the startup log when nothing fits.
func (m *Manager) discover() (cert *tls.Certificate, source string, notes []string) {
	cfg := m.cfg
	if cfg.CertFile != "" && cfg.KeyFile != "" {
		if c, err := loadPair(cfg.CertFile, cfg.KeyFile); err == nil {
			return c, cfg.CertFile, nil
		} else {
			slog.Error("tls: IMAP_TLS_CERT/IMAP_TLS_KEY unusable", "err", err)
		}
	}
	if cfg.CertPEM != "" && cfg.KeyPEM != "" {
		if c, err := parsePair([]byte(cfg.CertPEM), []byte(cfg.KeyPEM)); err == nil {
			return c, "IMAP_TLS_CERT_DATA", nil
		} else {
			slog.Error("tls: IMAP_TLS_CERT_DATA/IMAP_TLS_KEY_DATA unusable", "err", err)
		}
	}
	for _, p := range cfg.FilePairs {
		if fileExists(p[0]) && fileExists(p[1]) {
			c, err := loadPair(p[0], p[1])
			switch {
			case err != nil:
				notes = append(notes, p[0]+": unusable: "+err.Error())
			case !covers(c, cfg.Hostname):
				notes = append(notes, fmt.Sprintf("%s: for %v, not %s", p[0], c.Leaf.DNSNames, cfg.Hostname))
			default:
				return c, p[0], nil
			}
		}
	}
	for _, f := range cfg.AcmeFiles {
		c, note := fromAcmeJSON(f, cfg.Hostname)
		if c != nil {
			return c, f, nil
		}
		notes = append(notes, note)
	}
	for _, root := range cfg.CaddyRoots {
		dir := filepath.Join(root, cfg.Hostname)
		crt, key := filepath.Join(dir, cfg.Hostname+".crt"), filepath.Join(dir, cfg.Hostname+".key")
		if fileExists(crt) && fileExists(key) {
			if c, err := loadPair(crt, key); err == nil {
				return c, crt, nil
			}
		}
	}
	return nil, "", notes
}

// acmeFile is Traefik's storage: {"<resolver>": {"Certificates": [...]}}.
type acmeResolver struct {
	Certificates []struct {
		Domain struct {
			Main string   `json:"main"`
			SANs []string `json:"sans"`
		} `json:"domain"`
		Certificate string `json:"certificate"`
		Key         string `json:"key"`
	} `json:"Certificates"`
}

// fromAcmeJSON returns the longest-lived certificate in path covering host,
// or a note saying why there is none (missing file, other domains only, ...).
func fromAcmeJSON(path, host string) (*tls.Certificate, string) {
	data, err := os.ReadFile(path)
	if errors.Is(err, fs.ErrNotExist) {
		return nil, path + ": not found"
	} else if err != nil {
		return nil, path + ": " + err.Error()
	}
	var resolvers map[string]json.RawMessage
	if err := json.Unmarshal(data, &resolvers); err != nil {
		return nil, path + ": not valid JSON: " + err.Error()
	}
	var best *tls.Certificate
	var domains []string
	var problems []string
	for _, raw := range resolvers {
		var r acmeResolver
		if json.Unmarshal(raw, &r) != nil {
			continue
		}
		for _, c := range r.Certificates {
			names := append([]string{c.Domain.Main}, c.Domain.SANs...)
			domains = append(domains, names...)
			if !matchesAny(names, host) {
				continue
			}
			certPEM, err1 := base64.StdEncoding.DecodeString(c.Certificate)
			keyPEM, err2 := base64.StdEncoding.DecodeString(c.Key)
			if err1 != nil || err2 != nil {
				problems = append(problems, "bad base64")
				continue
			}
			cert, err := parsePair(certPEM, keyPEM)
			if err != nil {
				problems = append(problems, err.Error())
				continue
			}
			if time.Now().After(cert.Leaf.NotAfter) {
				problems = append(problems, "expired "+cert.Leaf.NotAfter.Format(time.DateOnly))
				continue
			}
			if best == nil || cert.Leaf.NotAfter.After(best.Leaf.NotAfter) {
				best = cert
			}
		}
	}
	if best != nil {
		return best, ""
	}
	if len(problems) > 0 {
		return nil, fmt.Sprintf("%s: certificate for %s unusable: %s", path, host, strings.Join(problems, "; "))
	}
	if len(domains) > 30 {
		domains = append(domains[:30], "…")
	}
	return nil, fmt.Sprintf("%s: %d certificates, none for %s (has: %s)", path, len(domains), host, strings.Join(domains, ", "))
}

func loadPair(certFile, keyFile string) (*tls.Certificate, error) {
	certPEM, err := os.ReadFile(certFile)
	if err != nil {
		return nil, err
	}
	keyPEM, err := os.ReadFile(keyFile)
	if err != nil {
		return nil, err
	}
	return parsePair(certPEM, keyPEM)
}

func parsePair(certPEM, keyPEM []byte) (*tls.Certificate, error) {
	cert, err := tls.X509KeyPair(certPEM, keyPEM)
	if err != nil {
		return nil, err
	}
	if cert.Leaf == nil {
		if cert.Leaf, err = x509.ParseCertificate(cert.Certificate[0]); err != nil {
			return nil, err
		}
	}
	return &cert, nil
}

// covers reports whether cert is valid for host (exact or wildcard).
func covers(cert *tls.Certificate, host string) bool {
	return cert.Leaf != nil && cert.Leaf.VerifyHostname(host) == nil
}

func matchesAny(names []string, host string) bool {
	for _, n := range names {
		n = strings.ToLower(strings.TrimSpace(n))
		if n == host {
			return true
		}
		// *.reloop.sh covers imap.reloop.sh, but not a.b.reloop.sh.
		if strings.HasPrefix(n, "*.") {
			if i := strings.IndexByte(host, '.'); i > 0 && host[i+1:] == n[2:] {
				return true
			}
		}
	}
	return false
}

func selfSigned(host string) (*tls.Certificate, error) {
	key, err := ecdsa.GenerateKey(elliptic.P256(), rand.Reader)
	if err != nil {
		return nil, err
	}
	serial, _ := rand.Int(rand.Reader, new(big.Int).Lsh(big.NewInt(1), 62))
	tmpl := &x509.Certificate{
		SerialNumber: serial,
		Subject:      pkix.Name{CommonName: host},
		DNSNames:     []string{host},
		NotBefore:    time.Now().Add(-time.Hour),
		NotAfter:     time.Now().AddDate(1, 0, 0),
		KeyUsage:     x509.KeyUsageDigitalSignature,
		ExtKeyUsage:  []x509.ExtKeyUsage{x509.ExtKeyUsageServerAuth},
	}
	der, err := x509.CreateCertificate(rand.Reader, tmpl, tmpl, &key.PublicKey, key)
	if err != nil {
		return nil, err
	}
	leaf, err := x509.ParseCertificate(der)
	if err != nil {
		return nil, err
	}
	return &tls.Certificate{Certificate: [][]byte{der}, PrivateKey: key, Leaf: leaf}, nil
}

func normalizeHost(h string) string {
	h = strings.ToLower(strings.TrimSpace(h))
	if i := strings.Index(h, "://"); i >= 0 {
		h = h[i+3:]
	}
	if i := strings.IndexAny(h, "/:"); i >= 0 {
		h = h[:i]
	}
	return h
}

func fileExists(p string) bool {
	st, err := os.Stat(p)
	return err == nil && !st.IsDir() && st.Size() > 0
}

func firstNonEmpty(vals ...string) string {
	for _, v := range vals {
		if v != "" {
			return v
		}
	}
	return ""
}
