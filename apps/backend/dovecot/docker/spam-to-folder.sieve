require ["fileinto", "regex"];

if header :regex "X-Spam-Flag" "YES" {
    fileinto "Spam";
}
