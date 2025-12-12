#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}==================================${NC}"
echo -e "${BLUE}      Send Email via Postfix      ${NC}"
echo -e "${BLUE}==================================${NC}"
echo ""

# Parse available domains
if [ -n "$MAIL_DOMAINS" ]; then
    IFS=',' read -ra DOMAINS <<< "$MAIL_DOMAINS"
else
    DOMAINS=("${MAIL_DOMAIN:-localhost}")
fi

# Show available domains
echo -e "${CYAN}Available domains:${NC}"
for i in "${!DOMAINS[@]}"; do
    DOMAIN=$(echo "${DOMAINS[$i]}" | tr -d '[:space:]')
    echo -e "  ${GREEN}[$((i+1))]${NC} $DOMAIN"
done
echo ""

# Select domain
if [ ${#DOMAINS[@]} -gt 1 ]; then
    read -p "Select domain (1-${#DOMAINS[@]}): " DOMAIN_INDEX
    DOMAIN_INDEX=${DOMAIN_INDEX:-1}
    DOMAIN=$(echo "${DOMAINS[$((DOMAIN_INDEX-1))]}" | tr -d '[:space:]')
else
    DOMAIN=$(echo "${DOMAINS[0]}" | tr -d '[:space:]')
fi

echo -e "${GREEN}Using domain: $DOMAIN${NC}"
echo ""

# Get sender info
read -p "From email username (e.g., noreply, hello, support): " FROM_USER
FROM_USER="${FROM_USER:-noreply}"
FROM_EMAIL="${FROM_USER}@${DOMAIN}"

read -p "From display name (e.g., 'Reloop Team'): " FROM_DISPLAY
FROM_DISPLAY="${FROM_DISPLAY:-$FROM_USER}"

echo -e "${GREEN}Sender: ${FROM_DISPLAY} <${FROM_EMAIL}>${NC}"
echo ""

# Get recipient
read -p "To (recipient email): " TO_EMAIL
if [ -z "$TO_EMAIL" ]; then
    echo -e "${RED}Error: Recipient email is required${NC}"
    exit 1
fi
echo ""

# Get subject
read -p "Subject: " SUBJECT
SUBJECT="${SUBJECT:-Test Email from Postfix}"
echo ""

# Get body
echo "Body (press Ctrl+D when done):"
BODY=$(cat)
echo ""

# Confirm
echo -e "${YELLOW}==================================${NC}"
echo -e "${YELLOW}Email Summary:${NC}"
echo -e "  From: ${FROM_DISPLAY} <${FROM_EMAIL}>"
echo -e "  To: ${TO_EMAIL}"
echo -e "  Subject: ${SUBJECT}"
echo -e "${YELLOW}==================================${NC}"
echo ""
read -p "Send this email? (y/n): " CONFIRM

if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
    echo -e "${RED}Cancelled.${NC}"
    exit 0
fi

# Send the email using mail command with proper From header
echo "$BODY" | mail -s "$SUBJECT" \
    -a "From: ${FROM_DISPLAY} <${FROM_EMAIL}>" \
    "$TO_EMAIL"

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✓ Email queued for delivery!${NC}"
    echo -e "  Check Postfix logs with: docker logs postfix"
else
    echo ""
    echo -e "${RED}✗ Failed to send email${NC}"
    exit 1
fi
