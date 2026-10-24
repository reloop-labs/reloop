// Command imap serves Reloop mail accounts over IMAP.
//
//	imap serve                                          run the server
//	imap create-account <email> <organizationId> <domainId>
//	imap app-password <email> [label]                   print a new app password
package main

import (
	"context"
	"crypto/rand"
	"crypto/tls"
	"fmt"
	"log"
	"log/slog"
	"net"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"github.com/emersion/go-imap/v2"
	"github.com/emersion/go-imap/v2/imapserver"
	"github.com/joho/godotenv"
	"github.com/nats-io/nats.go"
	"golang.org/x/crypto/bcrypt"

	"reloop/imap/internal/certs"
	"reloop/imap/internal/ingest"
	"reloop/imap/internal/mailstore"
	"reloop/imap/internal/store"
)

func main() {
	slog.SetDefault(slog.New(slog.NewJSONHandler(os.Stdout, nil)))
	// Local development reads .env (copy .env.dev); real env vars win.
	_ = godotenv.Load()

	cmd := "serve"
	if len(os.Args) > 1 {
		cmd = os.Args[1]
	}
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	s, err := store.New(ctx, mustEnv("PG_URL"))
	if err != nil {
		log.Fatal(err)
	}
	defer s.Close()

	switch cmd {
	case "serve":
		err = serve(ctx, s)
	case "create-account":
		err = createAccount(ctx, s, os.Args[2:])
	case "app-password":
		err = appPassword(ctx, s, os.Args[2:])
	default:
		err = fmt.Errorf("unknown command %q", cmd)
	}
	if err != nil {
		log.Fatal(err)
	}
}

func serve(ctx context.Context, s *store.Store) error {
	backend := mailstore.NewBackend(s)

	nc, err := nats.Connect(env("NATS_URL", nats.DefaultURL), nats.Name("reloop-imap"), nats.MaxReconnects(-1))
	if err != nil {
		return fmt.Errorf("connect nats: %w", err)
	}
	defer nc.Drain()
	if _, err := ingest.Subscribe(nc, backend); err != nil {
		return err
	}

	// Finds a certificate the same way the SMTP service does (explicit files,
	// Coolify/Traefik acme.json, Caddy, Let's Encrypt), else self-signed.
	certManager, err := certs.New(certs.ConfigFromEnv())
	if err != nil {
		return err
	}
	stopWatch := make(chan struct{})
	defer close(stopWatch)
	go certManager.Watch(5*time.Minute, stopWatch)
	tlsConfig := certManager.TLSConfig()
	insecureAuth := env("IMAP_ALLOW_INSECURE_AUTH", "") == "true"

	server := imapserver.New(&imapserver.Options{
		NewSession: backend.NewSession,
		Caps: imap.CapSet{
			imap.CapIMAP4rev1:    {},
			imap.CapIMAP4rev2:    {},
			imap.CapNamespace:    {},
			imap.CapUIDPlus:      {},
			imap.CapESearch:      {},
			imap.CapSearchRes:    {},
			imap.CapListExtended: {},
			imap.CapListStatus:   {},
			imap.CapMove:         {},
			imap.CapStatusSize:   {},
			imap.CapBinary:       {},
			imap.CapChildren:     {},
			imap.CapSpecialUse:   {},
			imap.CapLiteralPlus:  {},
		},
		TLSConfig:    tlsConfig,
		InsecureAuth: insecureAuth,
		Logger:       log.New(os.Stderr, "imapserver: ", log.LstdFlags),
	})

	errc := make(chan error, 3)
	plainAddr := env("IMAP_ADDR", ":143") // STARTTLS when TLS is configured
	ln, err := net.Listen("tcp", plainAddr)
	if err != nil {
		return err
	}
	slog.Info("imap listening", "addr", plainAddr, "starttls", true, "insecureAuth", insecureAuth)
	go func() { errc <- server.Serve(ln) }()

	tlsAddr := env("IMAP_TLS_ADDR", ":993")
	tln, err := tls.Listen("tcp", tlsAddr, tlsConfig)
	if err != nil {
		return err
	}
	slog.Info("imaps listening", "addr", tlsAddr, "certificate", certManager.Source())
	go func() { errc <- server.Serve(tln) }()

	healthAddr := env("HEALTH_ADDR", ":8031")
	go func() {
		mux := http.NewServeMux()
		mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
			if !nc.IsConnected() {
				http.Error(w, "nats disconnected", http.StatusServiceUnavailable)
				return
			}
			fmt.Fprintln(w, "ok")
		})
		errc <- http.ListenAndServe(healthAddr, mux)
	}()

	select {
	case <-ctx.Done():
		slog.Info("shutting down")
		return server.Close()
	case err := <-errc:
		return err
	}
}

func createAccount(ctx context.Context, s *store.Store, args []string) error {
	if len(args) != 3 {
		return fmt.Errorf("usage: imap create-account <email> <organizationId> <domainId>")
	}
	a, err := s.CreateAccount(ctx, args[0], args[1], args[2])
	if err != nil {
		return err
	}
	if err := mailstore.NewBackend(s).EnsureDefaultFolders(ctx, a.ID); err != nil {
		return err
	}
	fmt.Printf("created %s (%s)\n", a.Email, a.ID)
	return nil
}

// appPassword prints a new 16-letter app password, shown as xxxx-xxxx-xxxx-xxxx.
func appPassword(ctx context.Context, s *store.Store, args []string) error {
	if len(args) < 1 {
		return fmt.Errorf("usage: imap app-password <email> [label]")
	}
	a, err := s.AccountByEmail(ctx, args[0])
	if err != nil {
		return err
	}
	if a == nil {
		return fmt.Errorf("no account %s", args[0])
	}
	label := "Mail app"
	if len(args) > 1 {
		label = strings.Join(args[1:], " ")
	}

	const letters = "abcdefghijklmnopqrstuvwxyz"
	b := make([]byte, 16)
	if _, err := rand.Read(b); err != nil {
		return err
	}
	for i := range b {
		b[i] = letters[int(b[i])%len(letters)]
	}
	plain := string(b)
	hash, err := bcrypt.GenerateFromPassword([]byte(mailstore.NormalizeAppPassword(plain)), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	if err := s.CreateAppPassword(ctx, a.ID, label, string(hash)); err != nil {
		return err
	}
	fmt.Printf("%s-%s-%s-%s\n", plain[0:4], plain[4:8], plain[8:12], plain[12:16])
	return nil
}

func env(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func mustEnv(key string) string {
	v := os.Getenv(key)
	if v == "" {
		log.Fatalf("%s is required", key)
	}
	return v
}
