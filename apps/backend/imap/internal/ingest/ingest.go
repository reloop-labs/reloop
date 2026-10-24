// Package ingest files mail received by the inbound KumoMTA into IMAP accounts.
//
// KumoMTA publishes every accepted message on kumomta.inbound_received. The
// legacy inbox service consumes the same subject under its own queue group, so
// both stores see every message and each keeps only its own recipients.
package ingest

import (
	"bytes"
	"context"
	"encoding/json"
	"log/slog"
	"strings"

	"github.com/emersion/go-message/mail"
	"github.com/nats-io/nats.go"

	"reloop/imap/internal/mailstore"
	"reloop/imap/internal/store"
)

const (
	subject    = "kumomta.inbound_received"
	queueGroup = "imap-ingest"
)

type payload struct {
	RawMessage string `json:"rawMessage"`
	// Envelope recipients (RCPT TO). Older KumoMTA policies omit them, in
	// which case To/Cc/Delivered-To headers are used instead.
	Recipients []string `json:"recipients"`
}

func Subscribe(nc *nats.Conn, b *mailstore.Backend) (*nats.Subscription, error) {
	return nc.QueueSubscribe(subject, queueGroup, func(msg *nats.Msg) {
		var p payload
		if err := json.Unmarshal(msg.Data, &p); err != nil || p.RawMessage == "" {
			slog.Error("ingest: bad payload", "err", err)
			return
		}
		deliver(context.Background(), b, &p)
	})
}

func deliver(ctx context.Context, b *mailstore.Backend, p *payload) {
	raw := []byte(p.RawMessage)
	recipients := p.Recipients
	if len(recipients) == 0 {
		recipients = headerRecipients(raw)
	}
	spam := isSpam(raw)

	delivered := make(map[string]bool)
	for _, rcpt := range recipients {
		account, err := lookup(ctx, b.Store, rcpt)
		if err != nil {
			slog.Error("ingest: account lookup", "rcpt", rcpt, "err", err)
			continue
		}
		if account == nil || !account.Active || delivered[account.ID] {
			continue
		}
		if err := b.Deliver(ctx, account, raw, spam); err != nil {
			slog.Error("ingest: deliver", "account", account.Email, "err", err)
			continue
		}
		delivered[account.ID] = true
		slog.Info("ingest: delivered", "account", account.Email, "spam", spam, "size", len(raw))
	}
}

// lookup resolves an address, falling back from user+tag@ to user@.
func lookup(ctx context.Context, s *store.Store, addr string) (*store.Account, error) {
	addr = strings.ToLower(strings.Trim(strings.TrimSpace(addr), "<>"))
	account, err := s.AccountByEmail(ctx, addr)
	if account != nil || err != nil {
		return account, err
	}
	local, domain, ok := strings.Cut(addr, "@")
	if base, _, tagged := strings.Cut(local, "+"); ok && tagged {
		return s.AccountByEmail(ctx, base+"@"+domain)
	}
	return nil, nil
}

func headerRecipients(raw []byte) []string {
	r, err := mail.CreateReader(bytes.NewReader(raw))
	if err != nil && r == nil {
		return nil
	}
	var out []string
	for _, key := range []string{"Delivered-To", "To", "Cc"} {
		list, _ := r.Header.AddressList(key)
		for _, a := range list {
			out = append(out, a.Address)
		}
	}
	return out
}

// isSpam reads the X-Spam-Flag header added by the inbound Rspamd check.
func isSpam(raw []byte) bool {
	r, err := mail.CreateReader(bytes.NewReader(raw))
	if err != nil && r == nil {
		return false
	}
	return strings.EqualFold(strings.TrimSpace(r.Header.Get("X-Spam-Flag")), "YES")
}
