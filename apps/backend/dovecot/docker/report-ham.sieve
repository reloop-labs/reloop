require ["fileinto"];

if header :contains "X-Spam-Flag" "NO" {
    fileinto "INBOX";
}
