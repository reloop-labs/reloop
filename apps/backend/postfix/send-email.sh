#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}==================================${NC}"
echo -e "${BLUE}      Send Email via Postfix      ${NC}"
echo -e "${BLUE}==================================${NC}"
echo ""

# Get sender email
DOMAIN="${MAIL_DOMAIN:-localhost}"
read -p "From name (default: admin): " FROM_NAME
FROM_NAME="${FROM_NAME:-admin}"
FROM_EMAIL="${FROM_NAME}@${DOMAIN}"
echo -e "${GREEN}Sender: ${FROM_EMAIL}${NC}"
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
echo -e "  From: ${FROM_EMAIL}"
echo -e "  To: ${TO_EMAIL}"
echo -e "  Subject: ${SUBJECT}"
echo -e "${YELLOW}==================================${NC}"
echo ""
read -p "Send this email? (y/n): " CONFIRM

if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
    echo -e "${RED}Cancelled.${NC}"
    exit 0
fi

# Send the email using mail command
echo "$BODY" | mail -s "$SUBJECT" -r "$FROM_EMAIL" "$TO_EMAIL"

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✓ Email queued for delivery!${NC}"
    echo -e "  Check Postfix logs with: docker logs postfix-minimal"
else
    echo ""
    echo -e "${RED}✗ Failed to send email${NC}"
    exit 1
fi
