#!/bin/bash

# Test script for domain validation and email sending
# This script tests the Postfix configuration to ensure domains are properly validated

echo "=== Postfix Domain Validation Test ==="
echo ""

# Test 1: Check if domain exists in database
echo "1. Testing domain validation query..."
echo "Query: SELECT domain FROM domain WHERE domain='example.com' AND deleted_at IS NULL"
echo ""

# Test 2: Check Postfix configuration
echo "2. Checking Postfix configuration..."
echo "Virtual domain maps:"
grep "virtual_mailbox_domains" /etc/postfix/main.cf
echo ""

echo "Sender restrictions:"
grep "smtpd_sender_restrictions" /etc/postfix/main.cf
echo ""

echo "Recipient restrictions:"
grep "smtpd_recipient_restrictions" /etc/postfix/main.cf
echo ""

# Test 3: Check if Postfix is running
echo "3. Checking Postfix status..."
if systemctl is-active --quiet postfix; then
    echo "✅ Postfix is running"
else
    echo "❌ Postfix is not running"
fi
echo ""

# Test 4: Test domain lookup
echo "4. Testing domain lookup with postmap..."
echo "Testing domain lookup for 'example.com':"
echo "example.com" | postmap -q - pgsql:/etc/postfix/sql/pgsql_virtual_domains_maps.cf
echo ""

echo "=== Test Complete ==="
echo ""
echo "To test email sending:"
echo "1. Add a domain to the database using the API"
echo "2. Create a mailbox for that domain"
echo "3. Send an email using the mail service API"
echo ""
echo "Example API call to add domain:"
echo "POST /domain/add"
echo '{"domain": "example.com"}'
echo ""
echo "Example API call to send email:"
echo "POST /mail/send"
echo '{"from": "test@example.com", "to": "recipient@example.com", "subject": "Test", "text": "Test message"}'
